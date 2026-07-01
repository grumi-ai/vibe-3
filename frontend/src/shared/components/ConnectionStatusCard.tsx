import type { SystemHealth } from "../api/health";

type Props = {
  health: SystemHealth | null;
  error: string | null;
};

export function ConnectionStatusCard({ health, error }: Props) {
  return (
    <aside className="statusCard">
      <h2>연동 확인</h2>
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
            <dt>DB 파일</dt>
            <dd className="pathText">{health.database.database_path}</dd>
          </div>
        </dl>
      ) : (
        <p className="errorText">{error ?? "상태 확인 중"}</p>
      )}
    </aside>
  );
}
