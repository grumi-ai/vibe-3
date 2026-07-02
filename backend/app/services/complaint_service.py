from __future__ import annotations

import base64
import io
import re
import zipfile
import zlib
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree as ET

from app.repositories import complaint_repository
from app.schemas.complaint import (
    ComplaintChatRequest,
    ComplaintChatResponse,
    ManualCreate,
    ManualRead,
    ManualUploadRead,
    ManualUploadRequest,
)


@dataclass(frozen=True)
class ManualEvidence:
    manual: ManualRead
    score: int
    snippets: list[str]


def list_manuals() -> list[ManualRead]:
    return [ManualRead(**item) for item in complaint_repository.list_manuals()]


def create_manual(payload: ManualCreate) -> dict[str, object]:
    manual = complaint_repository.create_manual(payload)
    return {"item": ManualRead(**manual), "message": "민원 매뉴얼이 DB에 저장되었습니다."}


def upload_manual(payload: ManualUploadRequest) -> ManualUploadRead:
    filename = Path(payload.filename).name
    raw_bytes = base64.b64decode(payload.content_base64)
    content_text = _extract_text(filename, raw_bytes)
    manual = complaint_repository.create_manual(ManualCreate(filename=filename, content_text=content_text))
    return ManualUploadRead(item=ManualRead(**manual), message=f"{filename} 매뉴얼을 업로드했습니다.")


def _extract_text(filename: str, raw_bytes: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix in {".txt", ".md", ".csv", ".json", ".log"}:
        return raw_bytes.decode("utf-8-sig", errors="ignore").strip()
    if suffix == ".docx":
        return _extract_docx_text(raw_bytes)
    if suffix == ".pdf":
        return _extract_pdf_text(raw_bytes)
    return raw_bytes.decode("utf-8-sig", errors="ignore").replace("\x00", "").strip()


def _extract_docx_text(raw_bytes: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(raw_bytes)) as archive:
        try:
            document_xml = archive.read("word/document.xml")
        except KeyError:
            return ""

    root = ET.fromstring(document_xml)
    texts = [node.text or "" for node in root.findall(".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")]
    return _normalize_whitespace("\n".join(texts))


def _extract_pdf_text(raw_bytes: bytes) -> str:
    text_chunks: list[str] = []
    for stream in _extract_pdf_streams(raw_bytes):
        data = _maybe_decompress(stream)
        text_chunks.extend(_extract_pdf_strings(data))
    return _normalize_whitespace("\n".join(text_chunks))


def _maybe_decompress(data: bytes) -> bytes:
    if not data.startswith(b"\x78"):
        return data
    try:
        return zlib.decompress(data)
    except zlib.error:
        return data


def _extract_pdf_streams(raw_bytes: bytes) -> list[bytes]:
    return [match.group(1) for match in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", raw_bytes, flags=re.S)]


def _extract_pdf_strings(stream: bytes) -> list[str]:
    parts: list[str] = []
    for match in re.finditer(rb"(\((?:\\.|[^\\)])*\))\s*Tj", stream, flags=re.S):
        parts.append(_decode_pdf_literal_string(match.group(1)))
    for match in re.finditer(rb"<([0-9A-Fa-f\s]+)>\s*Tj", stream, flags=re.S):
        parts.append(_decode_pdf_hex_string(match.group(1)))
    for match in re.finditer(rb"\[(.*?)\]\s*TJ", stream, flags=re.S):
        parts.extend(_decode_pdf_array(match.group(1)))
    return parts


def _decode_pdf_array(chunk: bytes) -> list[str]:
    parts: list[str] = []
    for match in re.finditer(rb"\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f\s]+)>", chunk, flags=re.S):
        token = match.group(0)
        hex_chunk = match.group(1)
        if hex_chunk:
            parts.append(_decode_pdf_hex_string(hex_chunk))
        elif token.startswith(b"("):
            parts.append(_decode_pdf_literal_string(token))
    return parts


def _decode_pdf_literal_string(token: bytes) -> str:
    token = token.strip()
    if token.startswith(b"(") and token.endswith(b")"):
        token = token[1:-1]
    result = bytearray()
    escape = False
    for byte in token:
        if escape:
            mapping = {
                ord("n"): b"\n",
                ord("r"): b"\r",
                ord("t"): b"\t",
                ord("b"): b"\b",
                ord("f"): b"\f",
                ord("("): b"(",
                ord(")"): b")",
                ord("\\"): b"\\",
            }.get(byte)
            result.extend(mapping if mapping is not None else bytes([byte]))
            escape = False
            continue
        if byte == 0x5C:
            escape = True
            continue
        result.append(byte)
    return result.decode("utf-8", errors="ignore")


def _decode_pdf_hex_string(token: bytes) -> str:
    cleaned = re.sub(rb"\s+", b"", token)
    if len(cleaned) % 2 == 1:
        cleaned += b"0"
    try:
        raw = bytes.fromhex(cleaned.decode("ascii", errors="ignore"))
    except ValueError:
        return ""
    return raw.decode("utf-8", errors="ignore")


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[가-힣A-Za-z0-9]+", text.lower())
    stopwords = {
        "그리고",
        "또는",
        "그",
        "이",
        "저",
        "및",
        "대한",
        "관련",
        "처리",
        "방법",
        "안내",
        "문의",
        "민원",
        "사항",
        "합니다",
        "하세요",
    }
    return [token for token in tokens if len(token) > 1 and token not in stopwords]


def _split_sentences(text: str) -> list[str]:
    normalized = _normalize_whitespace(text)
    if not normalized:
        return []
    parts = re.split(r"(?<=[.!?])\s+|(?<=[。！？])\s+|\n+", normalized)
    sentences = [part.strip() for part in parts if part.strip()]
    return sentences


def _score_text(question_tokens: list[str], text: str) -> int:
    lower_text = text.lower()
    score = 0
    for token in question_tokens:
        if token and token in lower_text:
            score += 2 if len(token) >= 4 else 1
    return score


def _score_manual(question_tokens: list[str], manual: ManualRead) -> int:
    manual_text = f"{manual.filename} {manual.content_text or ''}".lower()
    score = _score_text(question_tokens, manual_text)
    if manual.filename.lower() in manual_text:
        score += 1
    return score


def _choose_relevant_manuals(question: str, manuals: list[ManualRead]) -> list[ManualRead]:
    if not manuals:
        return []

    tokens = _tokenize(question)
    if not tokens:
        return manuals[:3]

    scored = [(manual, _score_manual(tokens, manual)) for manual in manuals]
    scored.sort(key=lambda item: (item[1], item[0].uploaded_at), reverse=True)
    selected = [manual for manual, score in scored if score > 0]
    return selected[:3] if selected else manuals[:3]


def _extract_manual_evidence(question: str, manuals: list[ManualRead]) -> list[ManualEvidence]:
    tokens = _tokenize(question)
    evidence: list[ManualEvidence] = []

    for manual in manuals:
        sentences = _split_sentences(manual.content_text or "")
        scored_sentences = []
        for sentence in sentences:
            score = _score_text(tokens, sentence)
            if score > 0:
                scored_sentences.append((score, sentence))

        scored_sentences.sort(key=lambda item: item[0], reverse=True)
        snippets = [sentence for _, sentence in scored_sentences[:3]]
        score = _score_manual(tokens, manual) + sum(score for score, _ in scored_sentences[:3])
        evidence.append(ManualEvidence(manual=manual, score=score, snippets=snippets))

    evidence.sort(key=lambda item: (item.score, item.manual.uploaded_at), reverse=True)
    return [item for item in evidence if item.score > 0] or evidence[:3]


def _build_keywords(question: str, manuals: list[ManualRead]) -> list[str]:
    tokens = _tokenize(question)
    if not tokens:
        return ["민원", "매뉴얼", "응대"]

    combined = Counter(tokens)
    for manual in manuals:
        combined.update(_tokenize(manual.filename))
        combined.update(_tokenize(manual.content_text or ""))
    return [token for token, _ in combined.most_common(5)]


def _build_summary(question: str, evidence: list[ManualEvidence]) -> str:
    if not evidence:
        return "등록된 민원 매뉴얼이 없어서 일반 응대 기준으로 답변합니다."

    first = evidence[0]
    snippet = first.snippets[0] if first.snippets else "관련 문장을 찾지 못했습니다."
    return f"{first.manual.filename}에서 질문과 가장 가까운 안내를 찾았습니다. 핵심 문장: {snippet}"


def _build_script(question: str, evidence: list[ManualEvidence], keywords: list[str]) -> str:
    if not evidence:
        return (
            "안내드립니다. 현재 등록된 민원 매뉴얼이 없어 일반 응대 기준으로 답변합니다. "
            "민원 유형과 접수 경위를 먼저 확인한 뒤 담당 부서와 최신 지침을 다시 검토하세요."
        )

    lines = ["안내드립니다. 질문과 연결된 민원 매뉴얼을 확인한 결과를 기준으로 답변드립니다."]
    for item in evidence[:2]:
        source = item.manual.filename
        snippet = item.snippets[0] if item.snippets else "관련 문장을 찾지 못했습니다."
        lines.append(f"- {source}: {snippet}")
    lines.append(
        "응대 순서: 민원 유형 확인 -> 접수 정보 확인 -> 매뉴얼 기준 안내 -> 필요 시 담당 부서 연결 -> 처리 결과 재안내."
    )
    if keywords:
        lines.append(f"검토 키워드: {', '.join(keywords[:5])}.")
    return " ".join(lines)


def _build_checklist(question: str, evidence: list[ManualEvidence]) -> list[str]:
    checklist = [
        "민원 유형과 접수 일시를 먼저 확인하세요.",
        "매뉴얼에 나온 담당 부서와 연락 절차를 대조하세요.",
        "필요한 경우 최신 지침과 예외 규정을 함께 확인하세요.",
        "처리 완료 후 민원인에게 결과와 후속 안내를 다시 전달하세요.",
    ]

    if evidence:
        top = evidence[0]
        checklist.insert(0, f"{top.manual.filename}에서 관련 문장을 우선 확인하세요.")
        if top.snippets:
            checklist.insert(1, f"핵심 문장: {top.snippets[0]}")
    return checklist


def create_chat_response(payload: ComplaintChatRequest) -> ComplaintChatResponse:
    manuals = [ManualRead(**item) for item in complaint_repository.list_manuals()]
    relevant_manuals = _choose_relevant_manuals(payload.question, manuals)
    evidence = _extract_manual_evidence(payload.question, relevant_manuals)
    keywords = _build_keywords(payload.question, relevant_manuals)
    referenced_manuals = [item.manual.filename for item in evidence] if evidence else [manual.filename for manual in relevant_manuals[:3]]

    summary = _build_summary(payload.question, evidence)
    recommended_script = _build_script(payload.question, evidence, keywords)
    checklist = _build_checklist(payload.question, evidence)
    disclaimer = (
        "이 답변은 등록된 민원 매뉴얼의 내용을 바탕으로 자동 생성되었습니다. "
        "실제 대응 전에는 최신 지침, 담당 부서 기준, 법적 요건을 다시 확인하세요."
    )

    complaint_repository.create_chat_log(payload.question, recommended_script)
    return ComplaintChatResponse(
        summary=summary,
        recommended_script=recommended_script,
        checklist=checklist,
        referenced_manuals=referenced_manuals,
        disclaimer=disclaimer,
    )
