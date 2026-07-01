from app.schemas.excel import ExcelDownloadRead, ExcelJobRead, ExcelMergeRequest, ExcelSplitRequest


def create_split_job(payload: ExcelSplitRequest) -> ExcelJobRead:
    return ExcelJobRead(
        job_type="split",
        status="scaffold",
        message=f"{payload.filename} 파일을 {payload.column_name} 컬럼 기준으로 분할할 예정입니다.",
    )


def create_merge_job(payload: ExcelMergeRequest) -> ExcelJobRead:
    return ExcelJobRead(
        job_type="merge",
        status="scaffold",
        message=f"{len(payload.filenames)}개 파일 병합 작업을 생성할 예정입니다.",
    )


def get_download_placeholder(file_id: str) -> ExcelDownloadRead:
    return ExcelDownloadRead(
        file_id=file_id,
        status="scaffold",
        message="실제 파일 생성 후 다운로드 응답으로 교체될 엔드포인트입니다.",
    )
