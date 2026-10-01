import { useState, useEffect } from 'react';
import './App.css';

interface ApiHealthResponse {
  status: string;
  message: string;
}

interface DbHealthResponse {
  status: string;
  database?: string;
  message: string;
  details?: string;
}

export function App() {
  const [apiHealth, setApiHealth] = useState<ApiHealthResponse | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealthResponse | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkApiHealth = async () => {
    setLoadingApi(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setApiHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach API';
      setErrorMsg(`API error: ${msg}`);
      setApiHealth(null);
    } finally {
      setLoadingApi(false);
    }
  };

  const checkDbHealth = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch('/api/db-health');
      const data = await res.json();
      setDbHealth(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database ping failed';
      setDbHealth({
        status: 'error',
        database: 'disconnected',
        message: msg,
      });
    } finally {
      setLoadingDb(false);
    }
  };

  const checkAll = async () => {
    await checkApiHealth();
    await checkDbHealth();
  };

  useEffect(() => {
    checkAll();
  }, []);

  const isApiConnected = apiHealth?.status === 'ok';
  const isDbConnected = dbHealth?.database === 'connected';

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-badge">
          <span className="pulse-dot"></span>
          Step 1 Foundation Initialized
        </div>
        <h1 className="main-title">InternshipHub System</h1>
        <p className="main-subtitle">
          Full-stack architectural foundation verifying end-to-end communication
          across React, Express, Prisma ORM, and PostgreSQL.
        </p>
      </header>

      {/* Visual Pipeline Flow */}
      <section className="pipeline-section">
        <span className="section-label">End-to-End Architectural Pipeline</span>
        <div className="pipeline-track">
          {/* Node 1: React */}
          <div className="pipeline-node connected">
            <div className="node-header">
              <span className="node-icon">⚛️</span>
              <span className="node-status-badge ok">Active</span>
            </div>
            <div className="node-title">React Frontend</div>
            <div className="node-desc">Vite + React 19 + TypeScript (Port 5173)</div>
          </div>

          <div className="pipeline-arrow">➔</div>

          {/* Node 2: REST API */}
          <div className={`pipeline-node ${isApiConnected ? 'connected' : 'pending'}`}>
            <div className="node-header">
              <span className="node-icon">⚡</span>
              <span className={`node-status-badge ${isApiConnected ? 'ok' : 'warn'}`}>
                {isApiConnected ? 'Connected' : 'Pending'}
              </span>
            </div>
            <div className="node-title">REST API Layer</div>
            <div className="node-desc">GET /api/health (Proxy :5173 ➔ :5000)</div>
          </div>

          <div className="pipeline-arrow">➔</div>

          {/* Node 3: Express */}
          <div className={`pipeline-node ${isApiConnected ? 'connected' : 'pending'}`}>
            <div className="node-header">
              <span className="node-icon">🚀</span>
              <span className={`node-status-badge ${isApiConnected ? 'ok' : 'warn'}`}>
                {isApiConnected ? 'Online' : 'Checking'}
              </span>
            </div>
            <div className="node-title">Express Server</div>
            <div className="node-desc">TypeScript + tsx runtime (Port 5000)</div>
          </div>

          <div className="pipeline-arrow">➔</div>

          {/* Node 4: Prisma */}
          <div className="pipeline-node connected">
            <div className="node-header">
              <span className="node-icon">💎</span>
              <span className="node-status-badge ok">Generated</span>
            </div>
            <div className="node-title">Prisma ORM</div>
            <div className="node-desc">v6.4.1 Client with schema.prisma</div>
          </div>

          <div className="pipeline-arrow">➔</div>

          {/* Node 5: PostgreSQL */}
          <div className={`pipeline-node ${isDbConnected ? 'connected' : 'pending'}`}>
            <div className="node-header">
              <span className="node-icon">🐘</span>
              <span className={`node-status-badge ${isDbConnected ? 'ok' : 'warn'}`}>
                {isDbConnected ? 'Connected' : 'Configuring'}
              </span>
            </div>
            <div className="node-title">PostgreSQL DB</div>
            <div className="node-desc">
              {isDbConnected ? 'Live Connection' : 'Needs DATABASE_URL'}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Controls & Live Response Grid */}
      <div className="dashboard-grid">
        {/* API Response Card */}
        <div className="card">
          <div className="card-title">
            <span>📡</span> Express API Health Status
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tests direct communication between Vite React frontend and Express backend endpoint <code>/api/health</code>.
          </p>

          <div className="btn-group">
            <button
              id="ping-api-btn"
              className="btn btn-primary"
              onClick={checkApiHealth}
              disabled={loadingApi}
            >
              {loadingApi ? 'Pinging...' : 'Ping GET /api/health'}
            </button>
            <button
              id="ping-db-btn"
              className="btn btn-secondary"
              onClick={checkDbHealth}
              disabled={loadingDb}
            >
              {loadingDb ? 'Testing...' : 'Check DB Connection'}
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="terminal-block">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
              </div>
              <span className="terminal-title">Response: /api/health</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {lastChecked ? `Checked: ${lastChecked}` : 'Waiting...'}
              </span>
            </div>
            <div className="terminal-body">
              <pre>
                {apiHealth
                  ? JSON.stringify(apiHealth, null, 2)
                  : loadingApi
                  ? 'Requesting /api/health from Express...'
                  : 'Click "Ping GET /api/health" to test.'}
              </pre>
            </div>
          </div>
        </div>

        {/* Database & Environment Status Card */}
        <div className="card">
          <div className="card-title">
            <span>🗄️</span> Database & Prisma Status
          </div>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Prisma Client</span>
              <span className="info-value badge-green">Generated (v6.4.1)</span>
            </div>
            <div className="info-item">
              <span className="info-label">Prisma Schema</span>
              <span className="info-value">server/prisma/schema.prisma</span>
            </div>
            <div className="info-item">
              <span className="info-label">PostgreSQL Status</span>
              <span className={`info-value ${isDbConnected ? 'badge-green' : 'badge-amber'}`}>
                {isDbConnected ? 'Connected & Verified' : 'Awaiting Connection'}
              </span>
            </div>
          </div>

          <div className="terminal-block">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
              </div>
              <span className="terminal-title">Response: /api/db-health</span>
            </div>
            <div className="terminal-body">
              <pre>
                {dbHealth
                  ? JSON.stringify(dbHealth, null, 2)
                  : loadingDb
                  ? 'Querying PostgreSQL via Prisma...'
                  : 'Click "Check DB Connection" to test.'}
              </pre>
            </div>
          </div>

          <div className="help-box">
            <strong>Database URL setup:</strong><br />
            To connect PostgreSQL, set your connection string in <code>server/.env</code>:<br />
            <code>DATABASE_URL="postgresql://user:pass@host:5432/dbname"</code><br />
            Supports local PostgreSQL, Docker, or free cloud databases (Neon / Supabase).
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
