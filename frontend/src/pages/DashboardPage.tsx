import { useEffect, useState } from "react";
import { ComplaintChatbotPanel } from "../features/complaint-chatbot/ComplaintChatbotPanel";
import { ExcelAutomationPanel } from "../features/excel-automation/ExcelAutomationPanel";
import { NewsPanel } from "../features/news/NewsPanel";
import { SchedulePanel } from "../features/schedule/SchedulePanel";
import { getSystemHealth, type SystemHealth } from "../shared/api/health";
import { ConnectionStatusCard } from "../shared/components/ConnectionStatusCard";

const features = [
  { id: "schedule", label: "팀원 스케쥴", component: <SchedulePanel /> },
  { id: "excel", label: "엑셀 자동화", component: <ExcelAutomationPanel /> },
  { id: "complaints", label: "민원 챗봇", component: <ComplaintChatbotPanel /> },
  { id: "news", label: "뉴스 수집", component: <NewsPanel /> }
];

export function DashboardPage() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    getSystemHealth()
      .then((data) => {
        setHealth(data);
        setHealthError(null);
      })
      .catch((error: unknown) => {
        setHealth(null);
        setHealthError(error instanceof Error ? error.message : "API 연결 실패");
      });
  }, []);

  const currentFeature = features.find((feature) => feature.id === activeFeature);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">PUBLIC ADMIN SUPER APP</p>
          <h1>공공직군 행정업무 슈퍼앱</h1>
          <p className="lead">
            PRD와 Architecture 문서 기준의 스캐폴드입니다. 기능 구현 전 페이지 구조,
            FE-BE 연결, BE-DB 연결을 확인하는 데 집중합니다.
          </p>
        </div>
        <ConnectionStatusCard health={health} error={healthError} />
      </section>

      <nav className="tabBar" aria-label="기능 페이지">
        {features.map((feature) => (
          <button
            className={feature.id === activeFeature ? "tab active" : "tab"}
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            type="button"
          >
            {feature.label}
          </button>
        ))}
      </nav>

      <section className="pagePanel">{currentFeature?.component}</section>
    </main>
  );
}
