from pydantic import BaseModel


class ExcelSplitRequest(BaseModel):
    filename: str
    column_name: str


class ExcelMergeRequest(BaseModel):
    filenames: list[str]


class ExcelUploadRequest(BaseModel):
    filename: str
    content_base64: str


class ExcelJobRead(BaseModel):
    job_type: str
    status: str
    message: str
    file_id: str | None = None
    download_name: str | None = None
    download_url: str | None = None


class ExcelDownloadRead(BaseModel):
    file_id: str
    status: str
    message: str
    download_name: str | None = None
    download_path: str | None = None


class ExcelUploadRead(BaseModel):
    filename: str
    status: str
    message: str
