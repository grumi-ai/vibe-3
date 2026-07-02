import { type FormEvent, useEffect, useState } from "react";
import { getApiBaseUrl, setApiBaseUrl, subscribeApiBaseUrlChange } from "../api/client";
import { getSystemHealth, type SystemHealth } from "../api/health";

type Props = {
  onConnectionChange?: (health: SystemHealth | null, error: string | null) => void;
};

export function BackendSettingsPanel({ onConnectionChange }: Props) {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl);
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
      setTestResult(`${health.service} is ${health.status}`);
      onConnectionChange?.(health, null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Backend connection failed.";
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
        <p className="sectionEyebrow">Backend URL</p>
        <div>
          <h2 className="sectionTitle">Backend connection settings</h2>
          <p className="sectionDescription">
            Set the API host used by this browser. Use a Cloudflared HTTPS URL or another deployed backend URL.
          </p>
        </div>
      </header>

      <form className="backendSettingsForm" onSubmit={handleSubmit}>
        <label>
          API base URL
          <input
            value={apiUrl}
            onChange={(event) => setApiUrl(event.target.value)}
            placeholder="https://example.trycloudflare.com"
          />
        </label>
        <button type="submit" className="primaryButton" disabled={testing}>
          {testing ? "Testing..." : "Save and test"}
        </button>
        <button type="button" className="ghostButton" onClick={handleReset}>
          Use default
        </button>
      </form>

      <dl className="statusGrid">
        <div className="wide">
          <dt>Active API base URL</dt>
          <dd>{getApiBaseUrl() || "Same origin / Vite proxy"}</dd>
        </div>
      </dl>
      {testResult ? <p className="successText">{testResult}</p> : null}
      {testError ? <p className="errorText">{testError}</p> : null}
    </section>
  );
}
