import { type ChangeEvent, type FormEvent, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { excelEndpoints, mergeExcel, splitExcel, uploadExcelFile, type ExcelJobResponse } from "./api";

function parseFileList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

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

export function ExcelAutomationPanel() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [splitFilename, setSplitFilename] = useState("");
  const [splitColumn, setSplitColumn] = useState("");
  const [mergeFiles, setMergeFiles] = useState("");
  const [result, setResult] = useState<ExcelJobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadFile) {
      setError("업로드할 파일을 선택하세요.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const contentBase64 = await readFileAsBase64(uploadFile);
      const response = await uploadExcelFile(uploadFile.name, contentBase64);
      setUploadMessage(response.message);
      setSplitFilename(uploadFile.name);
      setMergeFiles((current) => {
        const items = new Set(parseFileList(current));
        items.add(uploadFile.name);
        return Array.from(items).join("\n");
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSplit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const response = await splitExcel(splitFilename.trim(), splitColumn.trim());
      setResult(response);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "분할 작업에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleMerge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const response = await mergeExcel(parseFileList(mergeFiles));
      setResult(response);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "병합 작업에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadFile(event.target.files?.[0] ?? null);
  }

  return (
    <FeatureScaffold
      badge="업무 자동화"
      title="엑셀 분할·병합 자동화"
      description="특정 컬럼 기준으로 파일을 나누거나 여러 파일을 하나로 합쳐서 결과물을 빠르게 생성합니다."
      apiEndpoint={`${excelEndpoints.upload}, ${excelEndpoints.split}, ${excelEndpoints.merge}, ${excelEndpoints.download}`}
      items={["파일 업로드", "컬럼 기준 분할", "다중 파일 병합", "결과 다운로드"]}
    >
      <p className="probeText">업로드된 파일은 `backend/app/storage/uploads`에 저장됩니다.</p>

      <section className="panelCard" style={{ marginBottom: 16 }}>
        <h3>파일 업로드</h3>
        <form className="stackForm" onSubmit={handleUpload}>
          <label>
            엑셀 또는 CSV 파일
            <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
          </label>
          <button type="submit" className="primaryButton" disabled={uploading}>
            {uploading ? "업로드 중..." : "업로드"}
          </button>
        </form>
        {uploadMessage ? <p className="successText">{uploadMessage}</p> : null}
      </section>

      <div className="twoColumn">
        <form className="stackForm" onSubmit={handleSplit}>
          <h3>분할 작업</h3>
          <label>
            원본 파일명
            <input value={splitFilename} onChange={(event) => setSplitFilename(event.target.value)} placeholder="예: 인사현황.xlsx" required />
          </label>
          <label>
            기준 컬럼명
            <input value={splitColumn} onChange={(event) => setSplitColumn(event.target.value)} placeholder="예: 부서" required />
          </label>
          <button type="submit" className="primaryButton" disabled={processing}>
            분할 실행
          </button>
        </form>

        <form className="stackForm" onSubmit={handleMerge}>
          <h3>병합 작업</h3>
          <label>
            병합할 파일명
            <textarea
              rows={5}
              value={mergeFiles}
              onChange={(event) => setMergeFiles(event.target.value)}
              placeholder={"예: 1.xlsx\n2.xlsx\n3.xlsx"}
              required
            />
          </label>
          <button type="submit" className="primaryButton" disabled={processing}>
            병합 실행
          </button>
        </form>
      </div>

      {error ? <p className="errorText">{error}</p> : null}
      {result ? (
        <div className="statusDetailCard" style={{ marginTop: 16 }}>
          <h3>작업 결과</h3>
          <p>{result.message}</p>
          <p>
            <strong>파일 ID:</strong> {result.file_id ?? "-"}
          </p>
          <p>
            <strong>다운로드 파일:</strong> {result.download_name ?? "-"}
          </p>
          {result.download_url ? (
            <a className="ghostButton" href={result.download_url}>
              다운로드 열기
            </a>
          ) : null}
        </div>
      ) : null}
    </FeatureScaffold>
  );
}
