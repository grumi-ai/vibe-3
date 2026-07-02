import type { SystemHealth } from "../api/health";

type Props = {
  health: SystemHealth | null;
  error: string | null;
};

export function ConnectionStatusCard({ health, error }: Props) {
  return (
    <aside className="statusCard">
      <h2>연결 확인</h2>
      {health ? (
        <dl>
          <div>
            <dt>FE-BE</dt>
            <dd>{health.status}</dd>
          </div>
          <div>
            <dt>BE-DB</dt>
            <dd>{health.database.status}</dd>
          </div>
          <div>
            <dt>SQLite</dt>
            <dd>{health.database.sqlite_version}</dd>
          </div>
          <div>
            <dt>DB 경로</dt>
            <dd className="pathText">{health.database.database_path}</dd>
          </div>
          <div>
            <dt>DB 테이블 수</dt>
            <dd>{health.database.tables.length}</dd>
          </div>
        </dl>
      ) : (
        <p className="errorText">{error ?? "상태를 확인하는 중입니다."}</p>
      )}
    </aside>
  );
}
