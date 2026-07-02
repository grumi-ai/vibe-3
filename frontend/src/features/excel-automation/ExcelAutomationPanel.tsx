import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { excelEndpoints } from "./api";

export function ExcelAutomationPanel() {
  return (
    <FeatureScaffold
      badge="Excel"
      title="엑셀 자동화"
      description="업로드, 분리, 병합, 다운로드 흐름을 가진 파일 처리 구조를 먼저 배치한다."
      apiEndpoint={`${excelEndpoints.split}, ${excelEndpoints.merge}`}
      items={["파일 업로드", "컬럼 선택", "분리/병합 실행", "결과 다운로드"]}
    />
  );
}
