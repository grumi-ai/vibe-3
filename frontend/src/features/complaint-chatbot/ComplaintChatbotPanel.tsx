import { useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { fetchManuals, type ManualItem } from "./api";

export function ComplaintChatbotPanel() {
  const [manuals, setManuals] = useState<ManualItem[]>([]);

  useEffect(() => {
    fetchManuals().then((data) => setManuals(data.items)).catch(() => setManuals([]));
  }, []);

  return (
    <FeatureScaffold
      badge="Complaint"
      title="민원 대응 챗봇"
      description="민원 매뉴얼을 기반으로 대응 요약과 답변 스크립트 초안을 제공하는 영역입니다."
      apiEndpoint="GET /api/complaints/manuals, POST /api/complaints/chat"
      items={["민원 매뉴얼 업로드", "민원 내용 입력", "검토용 답변 초안 출력"]}
    >
      <p className="probeText">현재 DB 매뉴얼 {manuals.length}건 조회됨</p>
    </FeatureScaffold>
  );
}
