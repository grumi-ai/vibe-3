import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { createComplaintChat, fetchManuals, uploadManualFile, type ComplaintChatResponse, type ManualItem } from "./api";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer)) {
        reject(new Error("파일을 읽지 못했습니다."));
        return;
      }
      const bytes = new Uint8Array(result);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      resolve(btoa(binary));
    };
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.readAsArrayBuffer(file);
  });
}

export function ComplaintChatbotPanel() {
  const [manuals, setManuals] = useState<ManualItem[]>([]);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualMessage, setManualMessage] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<ComplaintChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshManuals() {
    const data = await fetchManuals();
    setManuals(data.items);
  }

  useEffect(() => {
    refreshManuals().catch(() => setManuals([]));
  }, []);

  async function handleManualUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualFile) {
      setError("업로드할 민원 매뉴얼을 선택하세요.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const contentBase64 = await readFileAsBase64(manualFile);
      const result = await uploadManualFile(manualFile.name, contentBase64);
      setManualMessage(result.message);
      await refreshManuals();
      setManualFile(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "민원 매뉴얼 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createComplaintChat(question.trim());
      setResponse(result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "민원 답변 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setManualFile(event.target.files?.[0] ?? null);
  }

  return (
    <FeatureScaffold
      badge="민원 대응"
      title="민원 대응 챗봇"
      description="민원 매뉴얼을 업로드하고, 등록된 문서 내용 기반으로 응대 스크립트와 체크리스트를 생성합니다."
      apiEndpoint="GET /api/complaints/manuals, POST /api/complaints/manuals/upload, POST /api/complaints/chat"
      items={["민원 매뉴얼 업로드", "질문 입력", "문서 기반 응대 스크립트", "체크리스트 제공"]}
    >
      <p className="probeText">현재 DB에 등록된 민원 매뉴얼 {manuals.length}개를 불러왔습니다.</p>

      <section className="panelCard" style={{ marginBottom: 16 }}>
        <h3>민원 매뉴얼 업로드</h3>
        <form className="stackForm" onSubmit={handleManualUpload}>
          <label>
            매뉴얼 파일
            <input type="file" accept=".pdf,.docx,.txt,.md,.csv,.json,.log" onChange={handleFileChange} />
          </label>
          <p className="small">PDF, DOCX, TXT, MD, CSV, JSON, LOG 파일을 업로드할 수 있습니다.</p>
          <button type="submit" className="primaryButton" disabled={uploading}>
            {uploading ? "업로드 중..." : "업로드"}
          </button>
        </form>
        {manualMessage ? <p className="successText">{manualMessage}</p> : null}
      </section>

      <form className="stackForm" onSubmit={handleChatSubmit}>
        <label>
          민원 질문
          <textarea
            rows={5}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="예: 휴가 승인 절차와 반려 시 안내는 어떻게 해야 하나요?"
            required
          />
        </label>
        <div className="buttonRow">
          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? "생성 중..." : "답변 생성"}
          </button>
        </div>
      </form>

      {error ? <p className="errorText">{error}</p> : null}
      {response ? (
        <div className="statusDetailCard" style={{ marginTop: 16 }}>
          <h3>생성 결과</h3>
          <p>
            <strong>요약:</strong> {response.summary}
          </p>
          <p>
            <strong>응답 스크립트:</strong> {response.recommended_script}
          </p>
          <div>
            <strong>참조 매뉴얼</strong>
            <ul className="bulletList">
              {response.referenced_manuals.length > 0 ? (
                response.referenced_manuals.map((filename) => <li key={filename}>{filename}</li>)
              ) : (
                <li>참조한 매뉴얼이 없습니다.</li>
              )}
            </ul>
          </div>
          <div>
            <strong>체크리스트</strong>
            <ul className="bulletList">
              {response.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="small">{response.disclaimer}</p>
        </div>
      ) : null}
    </FeatureScaffold>
  );
}
