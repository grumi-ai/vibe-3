import { useEffect, useState } from "react";
import { FeatureScaffold } from "../../shared/components/FeatureScaffold";
import { fetchSchedules, type ScheduleItem } from "./api";

export function SchedulePanel() {
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    fetchSchedules().then((data) => setItems(data.items)).catch(() => setItems([]));
  }, []);

  return (
    <FeatureScaffold
      badge="Calendar"
      title="팀원 스케쥴 관리"
      description="팀원의 휴가, 근무, 출장, 교육 일정을 공유하는 캘린더 영역입니다."
      apiEndpoint="GET /api/schedules"
      items={["월간, 주간, 일간 캘린더", "팀원 및 일정 유형 필터", "일정 등록, 수정, 삭제"]}
    >
      <p className="probeText">현재 DB 일정 {items.length}건 조회됨</p>
    </FeatureScaffold>
  );
}
