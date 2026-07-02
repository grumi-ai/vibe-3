import { type FormEvent, useEffect, useState } from "react";
import { getApiBaseUrl, setApiBaseUrl, subscribeApiBaseUrlChange } from "../api/client";
import { getSystemHealth, type SystemHealth } from "../api/health";

type Props = {
  onConnectionChange?: (health: SystemHealth | null, error: string | null) => void;
};

export function BackendSettingsPanel({ onConnectionChange }: Props) {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => subscribeApiBaseUrlChange(() => setApiUrl(getApiBaseUrl())), []);

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      const health = await getSystemHealth();
      setTestResult(`${health.service} 상태: ${health.status}`);
      onConnectionChange?.(health, null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "백엔드 연결에 실패했습니다.";
      setTestError(message);
      onConnectionChange?.(null, message);
    } finally {
      setTesting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUrl = setApiBaseUrl(apiUrl);
    setApiUrl(normalizedUrl);
    await testConnection();
  }

  function handleReset() {
    setApiBaseUrl("");
    setApiUrl("");
    setTestResult(null);
    setTestError(null);
  }

  return (
    <section className="backendSettings">
      <header className="sectionHeader">
        <p className="sectionEyebrow">백엔드 연결</p>
        <div>
          <h2 className="sectionTitle">백엔드 주소 설정</h2>
          <p className="sectionDescription">
            현재 브라우저에서 사용할 API 주소를 지정합니다. 배포된 HTTPS 주소 또는 로컬 개발 서버 주소를 입력한 뒤 연결을 확인하세요.
          </p>
        </div>
      </header>

      <form className="backendSettingsForm" onSubmit={handleSubmit}>
        <label>
          API 기본 URL
          <input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="https://example.trycloudflare.com" />
        </label>
        <button type="submit" className="primaryButton" disabled={testing}>
          {testing ? "확인 중..." : "연결 확인"}
        </button>
        <button type="button" className="ghostButton" onClick={handleReset}>
          기본값 사용
        </button>
      </form>

      <dl className="statusGrid">
        <div className="wide">
          <dt>현재 API 기본 URL</dt>
          <dd>{getApiBaseUrl() || "동일 출처 / Vite 프록시"}</dd>
        </div>
      </dl>
      {testResult ? <p className="successText">{testResult}</p> : null}
      {testError ? <p className="errorText">{testError}</p> : null}
    </section>
  );
}
