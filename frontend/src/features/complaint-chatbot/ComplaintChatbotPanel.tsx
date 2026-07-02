import { useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { fetchManuals, type ManualItem } from "./api";

export function ComplaintChatbotPanel() {
  const [manuals, setManuals] = useState<ManualItem[]>([]);

  useEffect(() => {
    fetchManuals()
      .then((data) => setManuals(data.items))
      .catch(() => setManuals([]));
  }, []);

  return (
    <FeatureScaffold
      badge="Complaint"
      title="민원 챗봇"
      description="민원 매뉴얼 업로드와 상담 응답 생성을 분리한 구조를 먼저 배치한다."
      apiEndpoint="GET /api/complaints/manuals, POST /api/complaints/chat"
      items={["민원 매뉴얼 업로드", "민원 내용 입력", "검토 필요 항목 표시", "상담 응답 초안 생성"]}
    >
      <p className="probeText">현재 DB 민원 매뉴얼 {manuals.length}건을 조회했다.</p>
    </FeatureScaffold>
  );
}
