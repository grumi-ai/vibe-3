import { useEffect, useState } from "react";
import { NewsPanel } from "../features/news/NewsPanel";
import { TeamSchedulePanel } from "../features/team-schedule/TeamSchedulePanel";
import { getDatabaseHealth, getSystemHealth, type DatabaseHealth, type SystemHealth } from "../shared/api/health";
import { BackendSettingsPanel } from "../shared/components/BackendSettingsPanel";
import { ConnectionStatusCard } from "../shared/components/ConnectionStatusCard";

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
        setHealthError(error instanceof Error ? error.message : "FE-BE connection failed");
      }),

      getDatabaseHealth()
      .then((data) => {
        setDatabaseHealth(data);
        setDatabaseError(null);
      })
      .catch((error: unknown) => {
        setDatabaseHealth(null);
        setDatabaseError(error instanceof Error ? error.message : "BE-DB connection failed");
      }),
    ]);
  }

  useEffect(() => {
    refreshConnectionStatus();
  }, []);

  return (
    <main className="shell scaffoldShell">
      <section className="hero">
        <div>
          <p className="eyebrow">PUBLIC ADMIN SUPER APP</p>
          <h1>Team schedule scaffold</h1>
          <p className="lead">
            Build the member schedule workflow first, then wire FE-BE and BE-DB checks on the same page.
          </p>
        </div>
        <ConnectionStatusCard health={health} error={healthError} />
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
        <TeamSchedulePanel />
      </section>

      <section className="scaffoldSection">
        <NewsPanel />
      </section>

      <section className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">FE-BE Check</p>
          <div>
            <h2 className="sectionTitle">FE-BE connection</h2>
            <p className="sectionDescription">Confirm the frontend can call the backend health endpoint.</p>
          </div>
        </header>
        <div className="integrationGrid">
          <article className="statusDetailCard">
            <h3>Connection state</h3>
            {health ? (
              <dl className="statusGrid">
                <div>
                  <dt>Service</dt>
                  <dd>{health.service}</dd>
                </div>
                <div>
                  <dt>FE-BE</dt>
                  <dd>{health.status}</dd>
                </div>
                <div className="wide">
                  <dt>Endpoint</dt>
                  <dd>/api/health</dd>
                </div>
              </dl>
            ) : (
              <p className="errorText">{healthError ?? "Connection state is unavailable."}</p>
            )}
          </article>

          <article className="statusDetailCard">
            <h3>Check list</h3>
            <ul className="bulletList">
              <li>Frontend calls the health API on load.</li>
              <li>Error messages are shown when the call fails.</li>
              <li>Shared API client is reused by feature screens.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="scaffoldSection">
        <header className="sectionHeader">
          <p className="sectionEyebrow">BE-DB Check</p>
          <div>
            <h2 className="sectionTitle">BE-DB connection</h2>
            <p className="sectionDescription">Confirm SQLite schema and table information are returned by the backend.</p>
          </div>
        </header>
        <div className="integrationGrid">
          <article className="statusDetailCard">
            <h3>DB state</h3>
            {databaseHealth ? (
              <dl className="statusGrid">
                <div>
                  <dt>Status</dt>
                  <dd>{databaseHealth.status}</dd>
                </div>
                <div>
                  <dt>SQLite</dt>
                  <dd>{databaseHealth.sqlite_version}</dd>
                </div>
                <div className="wide">
                  <dt>DB path</dt>
                  <dd className="pathText">{databaseHealth.database_path}</dd>
                </div>
                <div className="wide">
                  <dt>Tables</dt>
                  <dd>{databaseHealth.tables.join(", ")}</dd>
                </div>
              </dl>
            ) : (
              <p className="errorText">{databaseError ?? "Database state is unavailable."}</p>
            )}
          </article>

          <article className="statusDetailCard">
            <h3>Check list</h3>
            <ul className="bulletList">
              <li>SQLite version is returned.</li>
              <li>Current DB file path is shown.</li>
              <li>Table list is returned from sqlite_master.</li>
              <li>health check rows are inserted into the DB.</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
