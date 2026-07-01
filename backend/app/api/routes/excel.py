from app.schemas.excel import ExcelDownloadRead, ExcelJobRead, ExcelMergeRequest, ExcelSplitRequest
from app.services import excel_service


def split_excel(payload: ExcelSplitRequest) -> ExcelJobRead:
    return excel_service.create_split_job(payload)


def merge_excel(payload: ExcelMergeRequest) -> ExcelJobRead:
    return excel_service.create_merge_job(payload)


def download_excel_result(file_id: str) -> ExcelDownloadRead:
    return excel_service.get_download_placeholder(file_id)
