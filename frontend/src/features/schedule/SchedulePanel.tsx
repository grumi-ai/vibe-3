import { useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { fetchSchedules, type ScheduleItem } from "./api";

export function SchedulePanel() {
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    fetchSchedules()
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <FeatureScaffold
      badge="일정"
      title="일정 관리"
      description="주간 뷰와 월간 뷰를 위한 일정 관리 구조를 먼저 배치합니다."
      apiEndpoint="GET /api/schedules"
      items={["일정 목록", "주간 리스트 뷰", "월간 캘린더 뷰", "일정 등록/수정/삭제"]}
    >
      <p className="probeText">현재 DB 일정 {items.length}건을 조회했습니다.</p>
    </FeatureScaffold>
  );
}
