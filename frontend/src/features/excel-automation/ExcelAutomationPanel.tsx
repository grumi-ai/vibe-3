import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { excelEndpoints } from "./api";

export function ExcelAutomationPanel() {
  return (
    <FeatureScaffold
      badge="Excel"
      title="엑셀 업무 자동화"
      description="특정 컬럼 기준 분할과 여러 엑셀 파일 병합을 처리하는 업무 자동화 영역입니다."
      apiEndpoint={`${excelEndpoints.split}, ${excelEndpoints.merge}`}
      items={["파일 업로드", "기준 컬럼 선택", "처리 결과 다운로드"]}
    />
  );
}
