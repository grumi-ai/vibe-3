from fastapi.responses import FileResponse

from app.schemas.excel import ExcelJobRead, ExcelMergeRequest, ExcelSplitRequest, ExcelUploadRead, ExcelUploadRequest
from app.services import excel_service


def upload_excel_file(payload: ExcelUploadRequest) -> ExcelUploadRead:
    return excel_service.upload_spreadsheet(payload)


def split_excel(payload: ExcelSplitRequest) -> ExcelJobRead:
    return excel_service.create_split_job(payload)


def merge_excel(payload: ExcelMergeRequest) -> ExcelJobRead:
    return excel_service.create_merge_job(payload)


def download_excel_result(file_id: str) -> FileResponse:
    result = excel_service.get_download_placeholder(file_id)
    assert result.download_path is not None
    return FileResponse(result.download_path, filename=result.download_name or result.file_id)
