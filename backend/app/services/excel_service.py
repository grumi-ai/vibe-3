from __future__ import annotations

import base64
import zipfile
from pathlib import Path

from app.schemas.excel import (
    ExcelDownloadRead,
    ExcelJobRead,
    ExcelMergeRequest,
    ExcelSplitRequest,
    ExcelUploadRead,
    ExcelUploadRequest,
)
from app.utils.spreadsheet import (
    TableData,
    build_artifact_filename,
    merge_tables,
    read_table,
    slugify,
    split_rows_by_column,
    write_xlsx,
)

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "storage" / "uploads"
GENERATED_DIR = BASE_DIR / "storage" / "generated"


def _ensure_storage_dirs() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)


def upload_spreadsheet(payload: ExcelUploadRequest) -> ExcelUploadRead:
    _ensure_storage_dirs()
    filename = Path(payload.filename).name
    target_path = UPLOAD_DIR / filename
    content = base64.b64decode(payload.content_base64)
    target_path.write_bytes(content)
    return ExcelUploadRead(filename=filename, status="ready", message=f"{filename} 파일을 업로드했습니다.")


def _resolve_source_file(filename: str) -> Path:
    _ensure_storage_dirs()
    candidate = (UPLOAD_DIR / Path(filename).name).resolve()
    if UPLOAD_DIR.resolve() not in candidate.parents and candidate != UPLOAD_DIR.resolve():
        raise ValueError("유효하지 않은 파일 이름입니다.")
    if not candidate.exists():
        raise FileNotFoundError(f"업로드 파일을 찾을 수 없습니다: {candidate.name}")
    return candidate


def _build_job_response(
    *,
    job_type: str,
    message: str,
    file_id: str | None = None,
    download_name: str | None = None,
) -> ExcelJobRead:
    download_url = f"/api/excel/download/{file_id}" if file_id else None
    return ExcelJobRead(
        job_type=job_type,
        status="ready",
        message=message,
        file_id=file_id,
        download_name=download_name,
        download_url=download_url,
    )


def create_split_job(payload: ExcelSplitRequest) -> ExcelJobRead:
    source_path = _resolve_source_file(payload.filename)
    table = read_table(source_path)
    groups = split_rows_by_column(table, payload.column_name)

    if not groups:
        raise ValueError("분할할 데이터가 없습니다.")

    file_id = build_artifact_filename("excel-split", ".zip")
    archive_path = GENERATED_DIR / file_id
    summary = []

    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for group_name, rows in groups.items():
            safe_name = slugify(group_name)
            result_name = f"{safe_name}.xlsx"
            workbook_path = GENERATED_DIR / f"{archive_path.stem}-{safe_name}.xlsx"
            write_xlsx(workbook_path, table.headers, rows, sheet_name=safe_name[:31] or "Sheet1")
            archive.write(workbook_path, arcname=result_name)
            workbook_path.unlink(missing_ok=True)
            summary.append(f"{group_name}({len(rows)}건)")

    message = f"{source_path.name} 파일을 {payload.column_name} 기준으로 분할했습니다: {', '.join(summary)}"
    return _build_job_response(job_type="split", message=message, file_id=file_id, download_name=archive_path.name)


def create_merge_job(payload: ExcelMergeRequest) -> ExcelJobRead:
    _ensure_storage_dirs()
    if not payload.filenames:
        raise ValueError("병합할 파일을 하나 이상 지정하세요.")

    tables: list[TableData] = []
    resolved_names: list[str] = []
    for filename in payload.filenames:
        source_path = _resolve_source_file(filename)
        tables.append(read_table(source_path))
        resolved_names.append(source_path.name)

    merged = merge_tables(tables)
    file_id = build_artifact_filename("excel-merge", ".xlsx")
    output_path = GENERATED_DIR / file_id
    write_xlsx(output_path, merged.headers, merged.rows, sheet_name="Merged")

    message = f"{len(resolved_names)}개 파일을 병합했습니다: {', '.join(resolved_names)}"
    return _build_job_response(job_type="merge", message=message, file_id=file_id, download_name=output_path.name)


def get_download_placeholder(file_id: str) -> ExcelDownloadRead:
    _ensure_storage_dirs()
    candidate = (GENERATED_DIR / Path(file_id).name).resolve()
    if GENERATED_DIR.resolve() not in candidate.parents and candidate != GENERATED_DIR.resolve():
        raise ValueError("유효하지 않은 파일 식별자입니다.")
    if not candidate.exists():
        raise FileNotFoundError(f"생성된 파일을 찾을 수 없습니다: {candidate.name}")

    return ExcelDownloadRead(
        file_id=candidate.name,
        status="ready",
        message="생성된 파일을 다운로드할 수 있습니다.",
        download_name=candidate.name,
        download_path=str(candidate),
    )
