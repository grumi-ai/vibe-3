from pydantic import BaseModel


class ExcelSplitRequest(BaseModel):
    filename: str
    column_name: str


class ExcelMergeRequest(BaseModel):
    filenames: list[str]


class ExcelJobRead(BaseModel):
    job_type: str
    status: str
    message: str


class ExcelDownloadRead(BaseModel):
    file_id: str
    status: str
    message: str
