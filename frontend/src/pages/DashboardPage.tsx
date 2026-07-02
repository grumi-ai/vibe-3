import { useEffect, useState } from "react";
import { ComplaintChatbotPanel } from "../features/complaint-chatbot/ComplaintChatbotPanel";
import { ExcelAutomationPanel } from "../features/excel-automation/ExcelAutomationPanel";
import { NewsPanel } from "../features/news/NewsPanel";
import { TeamSchedulePanel } from "../features/team-schedule/TeamSchedulePanel";
import { getDatabaseHealth, getSystemHealth, type DatabaseHealth, type SystemHealth } from "../shared/api/health";
import { BackendSettingsPanel } from "../shared/components/BackendSettingsPanel";

const dashboardCards = [
  { anchor: "#schedule-dashboard", index: "01", title: "팀원 스케줄 관리", accent: "green" },
  { anchor: "#excel-dashboard", index: "02", title: "엑셀 업무 자동화", accent: "blue" },
  { anchor: "#complaint-dashboard", index: "03", title: "민원 대응 챗봇", accent: "amber" },
  { anchor: "#news-dashboard", index: "04", title: "뉴스 기사 수집", accent: "violet" },
] as const;

export function DashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [databaseHealth, setDatabaseHealth] = useState<DatabaseHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  async function refreshConnectionStatus() {
    await Promise.all([
      getSystemHealth()
        .then((data) => {
          setHealth(data);
          setHealthError(null);
        })
        .catch((error: unknown) => {
          setHealth(null);
          setHealthError(error instanceof Error ? error.message : "FE-BE 연결에 실패했습니다.");
        }),
      getDatabaseHealth()
        .then((data) => {
          setDatabaseHealth(data);
          setDatabaseError(null);
        })
        .catch((error: unknown) => {
          setDatabaseHealth(null);
          setDatabaseError(error instanceof Error ? error.message : "BE-DB 연결에 실패했습니다.");
        }),
    ]);
  }

  useEffect(() => {
    refreshConnectionStatus();
  }, []);

  return (
    <main className="shell scaffoldShell">
      <section className="hero">
        <div className="heroContent">
          <p className="eyebrow">공공직군 행정업무 슈퍼앱</p>
          <h1>행정 업무 대시보드</h1>
        </div>
      </section>

      <section className="dashboardMenuSection">
        <div className="dashboardMenuGrid">
          {dashboardCards.map((card) => (
            <a key={card.title} className={`dashboardMenuCard accent-${card.accent}`} href={card.anchor}>
              <span className="dashboardMenuIndex">{card.index}</span>
              <span className="dashboardMenuTitle">{card.title}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="schedule-dashboard" className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">업무 대시보드 01</p>
          <div>
            <h2 className="sectionTitle">팀원 스케줄 관리</h2>
          </div>
        </header>
        <TeamSchedulePanel />
      </section>

      <section id="excel-dashboard" className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">업무 대시보드 02</p>
          <div>
            <h2 className="sectionTitle">엑셀 업무 자동화</h2>
          </div>
        </header>
        <ExcelAutomationPanel />
      </section>

      <section id="complaint-dashboard" className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">업무 대시보드 03</p>
          <div>
            <h2 className="sectionTitle">민원 대응 챗봇</h2>
          </div>
        </header>
        <ComplaintChatbotPanel />
      </section>

      <section id="news-dashboard" className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">업무 대시보드 04</p>
          <div>
            <h2 className="sectionTitle">뉴스 기사 수집</h2>
          </div>
        </header>
        <NewsPanel />
      </section>

      <section className="scaffoldSection">
        <BackendSettingsPanel
          onConnectionChange={(nextHealth, nextError) => {
            setHealth(nextHealth);
            setHealthError(nextError);
            refreshConnectionStatus();
          }}
        />
      </section>

      <section className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">운영 확인</p>
          <div>
            <h2 className="sectionTitle">FE-BE / BE-DB 연결 상태</h2>
          </div>
        </header>
        <div className="integrationGrid">
          <article className="statusDetailCard">
            <h3>FE-BE 상태</h3>
            {health ? (
              <dl className="statusGrid">
                <div>
                  <dt>서비스</dt>
                  <dd>{health.service}</dd>
                </div>
                <div>
                  <dt>상태</dt>
                  <dd>{health.status}</dd>
                </div>
                <div className="wide">
                  <dt>엔드포인트</dt>
                  <dd>/api/health</dd>
                </div>
              </dl>
            ) : (
              <p className="errorText">{healthError ?? "연결 상태를 불러오지 못했습니다."}</p>
            )}
          </article>

          <article className="statusDetailCard">
            <h3>BE-DB 상태</h3>
            {databaseHealth ? (
              <dl className="statusGrid">
                <div>
                  <dt>상태</dt>
                  <dd>{databaseHealth.status}</dd>
                </div>
                <div>
                  <dt>SQLite</dt>
                  <dd>{databaseHealth.sqlite_version}</dd>
                </div>
                <div className="wide">
                  <dt>DB 경로</dt>
                  <dd className="pathText">{databaseHealth.database_path}</dd>
                </div>
                <div className="wide">
                  <dt>테이블</dt>
                  <dd>{databaseHealth.tables.join(", ")}</dd>
                </div>
              </dl>
            ) : (
              <p className="errorText">{databaseError ?? "DB 상태를 불러오지 못했습니다."}</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
