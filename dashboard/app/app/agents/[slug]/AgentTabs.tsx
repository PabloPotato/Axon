// dashboard/app/app/agents/[slug]/AgentTabs.tsx
// Client Component — tabs: Overview · Policy · Audit · Approvals · Settings.
// All data passed from Server Component as props.

"use client";

import { useState, useTransition } from "react";
import { formatRelativeTime, truncateHash } from "@/lib/utils";
import dynamic from "next/dynamic";
import { FileDown, Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="ax-muted" style={{ fontSize: 13 }}>Loading editor…</span>
    </div>
  ),
});

type Policy = {
  id: string;
  version: string;
  source: string;
  hash: string;
  active: boolean;
  created_at: string;
};

type AuditRecord = {
  id: string;
  decision: Record<string, unknown>;
  self_hash: string;
  prev_record_hash: string;
  created_at: string;
  action: Record<string, unknown>;
};

type Approval = {
  id: string;
  status: string;
  requested_approver: string | null;
  timeout_at: string | null;
  created_at: string;
  audit_record_id: string;
};

interface Props {
  agent: { id: string; slug: string; display_name: string };
  policies: Policy[];
  auditRecords: AuditRecord[];
  approvals: Approval[];
  activePolicy: Policy | null;
  operatorId: string;
}

const TABS = ["Overview", "Policy", "Simulator", "Audit", "Approvals", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function AgentTabs({
  agent,
  policies,
  auditRecords,
  approvals,
  activePolicy,
  operatorId,
}: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [policySource, setPolicySource] = useState(activePolicy?.source ?? "");
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const [simulationResult, setSimulationResult] = useState<unknown | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationPayload, setSimulationPayload] = useState(JSON.stringify({
    action: {
      type: "spend",
      amount: "50",
      currency: "USDC",
      endpoint: "https://api.example.com/pay"
    }
  }, null, 2));

  const handleSimulateAction = async () => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const payload = JSON.parse(simulationPayload);
      const res = await fetch("http://localhost:3005/v1/actions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer intaglio_simulator_bypass",
          "X-Simulator-Agent-Id": agent.id
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as unknown;
      setSimulationResult({ status: res.status, data });
    } catch (err) {
      setSimulationResult({ error: String(err) });
    } finally {
      setSimulating(false);
    }
  };

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agent.id, source: policySource }),
      });
      const json = await res.json() as { version?: string; error?: string };
      if (!res.ok) {
        setSaveResult(`Error: ${json.error ?? "unknown"}`);
      } else {
        setSaveResult(`Saved v${json.version ?? "?"}`);
      }
    } catch {
      setSaveResult("Network error");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleDecision = async (approvalId: string, decision: "approved" | "denied") => {
    startTransition(async () => {
      await fetch(`/api/approvals/${approvalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
    });
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const url = `/api/audit/pdf?agent_id=${encodeURIComponent(agent.id)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        alert(`PDF export failed: ${err.error ?? res.statusText}`);
        return;
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? `intaglio-audit-${agent.slug}.pdf`;
      a.click();
      URL.revokeObjectURL(objUrl);
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div>
      {/* ── Tab row ──────────────────────────────────────────────────── */}
      <div className="ax-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            id={`agent-tab-${t.toLowerCase()}`}
            onClick={() => setTab(t)}
            className={`ax-tab ${tab === t ? "ax-tab--active" : ""}`}
          >
            {t}
            {t === "Approvals" && approvals.length > 0 && (
              <span className="ax-tab-badge">{approvals.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────── */}
      {tab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div className="ax-stat">
            <p className="ax-stat-label">Total actions</p>
            <p className="ax-stat-value">{auditRecords.length}</p>
          </div>
          <div className="ax-stat">
            <p className="ax-stat-label">Active policy</p>
            <p className={activePolicy ? "ax-stat-value--mono" : "ax-stat-value"} style={{ color: activePolicy ? "var(--color-success)" : "var(--color-muted-foreground)" }}>
              {activePolicy ? `v${activePolicy.version}` : "None"}
            </p>
          </div>
          <div className="ax-stat">
            <p className="ax-stat-label">Pending approvals</p>
            <p className="ax-stat-value" style={{ color: approvals.length > 0 ? "var(--color-warning)" : undefined }}>
              {approvals.length}
            </p>
          </div>
        </div>
      )}

      {/* ── Policy ───────────────────────────────────────────────────── */}
      {tab === "Policy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
            <MonacoEditor
              height="360px"
              defaultLanguage="plaintext"
              value={policySource}
              onChange={(v) => setPolicySource(v ?? "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                renderLineHighlight: "none",
                overviewRulerBorder: false,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              id="policy-save-btn"
              onClick={handleSavePolicy}
              disabled={savingPolicy}
              className="ax-btn ax-btn--primary"
            >
              {savingPolicy ? "Saving…" : "Save new version"}
            </button>
            {saveResult && (
              <span style={{ fontSize: 13, color: saveResult.startsWith("Error") ? "var(--color-destructive)" : "var(--color-success)" }}>
                {saveResult}
              </span>
            )}
          </div>

          {/* Version history */}
          {policies.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p className="ax-section-label">Version History</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {policies.map((p) => (
                  <div
                    key={p.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, padding: "6px 8px", borderRadius: 6 }}
                    className="ax-table tbody tr"
                  >
                    <span className="ax-mono" style={{ color: p.active ? "var(--color-success)" : "var(--color-muted-foreground)" }}>
                      v{p.version}{p.active ? " (active)" : ""}
                    </span>
                    <span className="ax-mono ax-muted">{truncateHash(p.hash)}</span>
                    <span className="ax-muted" style={{ marginLeft: "auto" }}>{formatRelativeTime(p.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Simulator ────────────────────────────────────────────────── */}
      {tab === "Simulator" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="ax-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p className="ax-label" style={{ marginBottom: 8 }}>Test Payload (JSON)</p>
              <div style={{ borderRadius: "var(--radius)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
                <MonacoEditor
                  height="260px"
                  defaultLanguage="json"
                  value={simulationPayload}
                  onChange={(v) => setSimulationPayload(v ?? "")}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
                />
              </div>
            </div>
            <button
              id="dispatch-action-btn"
              onClick={handleSimulateAction}
              disabled={simulating}
              className="ax-btn ax-btn--primary"
            >
              {simulating ? "Simulating…" : "Dispatch Action"}
            </button>
          </div>
          
          <div className="ax-card">
            <p className="ax-label" style={{ marginBottom: 8 }}>Proxy Response</p>
            {simulationResult ? (
              <pre style={{
                borderRadius: 8,
                background: "var(--color-bg)",
                padding: 12,
                fontSize: 12,
                overflowX: "auto",
                fontFamily: "var(--font-mono)",
                border: "1px solid var(--color-border)",
                whiteSpace: "pre-wrap",
              }}>
                {JSON.stringify(simulationResult, null, 2)}
              </pre>
            ) : (
              <p className="ax-muted" style={{ fontSize: 13 }}>Click Dispatch Action to see the proxy response. This bypasses the UI and creates a true real-time engine evaluation.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Audit ────────────────────────────────────────────────────── */}
      {tab === "Audit" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p className="ax-muted" style={{ fontSize: 13 }}>
              {auditRecords.length} record{auditRecords.length !== 1 ? "s" : ""} — last 50 shown
            </p>
            <button
              id="download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || auditRecords.length === 0}
              className="ax-btn ax-btn--primary"
            >
              {downloadingPDF ? (
                <Loader2 className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {downloadingPDF ? "Generating…" : "Download Report"}
            </button>
          </div>

          <div className="ax-table-card">
            <table className="ax-table">
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Hash</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {auditRecords.map((r) => {
                  const decision = r.decision as { outcome: string; reason?: string };
                  return (
                    <tr
                      key={r.id}
                      id={`audit-row-${r.id}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedRecord(r)}
                    >
                      <td><OutcomeBadge outcome={decision.outcome} /></td>
                      <td><span className="ax-mono ax-muted" style={{ fontSize: 12 }}>{truncateHash(r.self_hash)}</span></td>
                      <td><span className="ax-muted" style={{ fontSize: 12 }}>{formatRelativeTime(r.created_at)}</span></td>
                    </tr>
                  );
                })}
                {auditRecords.length === 0 && (
                  <tr>
                    <td colSpan={3} className="ax-table-empty">No audit records yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedRecord && (
            <AuditSheet record={selectedRecord} onClose={() => setSelectedRecord(null)} />
          )}
        </div>
      )}

      {/* ── Approvals ────────────────────────────────────────────────── */}
      {tab === "Approvals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {approvals.length === 0 && (
            <p className="ax-muted" style={{ fontSize: 13 }}>No pending approvals.</p>
          )}
          {approvals.map((ap) => (
            <div key={ap.id} id={`approval-${ap.id}`} className="ax-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="ax-mono ax-muted" style={{ fontSize: 12 }}>{ap.id.slice(0, 8)}…</p>
                {ap.requested_approver && (
                  <p className="ax-muted" style={{ fontSize: 12, marginTop: 2 }}>
                    Approver: {ap.requested_approver}
                  </p>
                )}
                {ap.timeout_at && (
                  <p style={{ fontSize: 12, marginTop: 2, color: "var(--color-warning)" }}>
                    Times out: {formatRelativeTime(ap.timeout_at)}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  id={`approve-btn-${ap.id}`}
                  onClick={() => handleDecision(ap.id, "approved")}
                  disabled={isPending}
                  className="ax-btn ax-btn--success ax-btn--sm"
                >
                  Approve
                </button>
                <button
                  id={`deny-btn-${ap.id}`}
                  onClick={() => handleDecision(ap.id, "denied")}
                  disabled={isPending}
                  className="ax-btn ax-btn--danger ax-btn--sm"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Settings ─────────────────────────────────────────────────── */}
      {tab === "Settings" && (
        <div style={{ maxWidth: 360, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="ax-label" htmlFor="agent-display-name">Display name</label>
            <input
              id="agent-display-name"
              defaultValue={agent.display_name}
              className="ax-input"
            />
          </div>
          <div>
            <label className="ax-label">Agent ID</label>
            <input
              readOnly
              value={agent.id}
              className="ax-input ax-input--readonly ax-mono"
            />
          </div>
          <p className="ax-muted" style={{ fontSize: 12 }}>
            Agent settings editing coming in v0.2.
          </p>
        </div>
      )}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVE: { label: "Approved", cls: "ax-badge--approve" },
    DENY: { label: "Denied", cls: "ax-badge--deny" },
    REQUIRE_APPROVAL: { label: "Pending", cls: "ax-badge--pending" },
  };
  const style = map[outcome] ?? { label: outcome, cls: "" };
  return <span className={`ax-badge ${style.cls}`}>{style.label}</span>;
}

function AuditSheet({
  record,
  onClose,
}: {
  record: AuditRecord;
  onClose: () => void;
}) {
  const decision = record.decision as { outcome: string; reason?: string };
  return (
    <div className="ax-sheet-backdrop" id="audit-detail-sheet" onClick={onClose}>
      <div className="ax-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ax-sheet-header">
          <h2 className="ax-sheet-title">Audit Record</h2>
          <button id="audit-sheet-close" onClick={onClose} className="ax-sheet-close">
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Outcome">
            <OutcomeBadge outcome={decision.outcome} />
          </Field>
          {decision.reason && (
            <Field label="Reason">
              <span className="ax-mono" style={{ fontSize: 12 }}>{decision.reason}</span>
            </Field>
          )}
          <Field label="Self hash">
            <span className="ax-mono" style={{ fontSize: 12, wordBreak: "break-all" }}>{record.self_hash}</span>
          </Field>
          <Field label="Prev hash">
            <span className="ax-mono" style={{ fontSize: 12, wordBreak: "break-all" }}>{record.prev_record_hash}</span>
          </Field>
          <Field label="Timestamp">
            <span style={{ fontSize: 13 }}>{new Date(record.created_at).toISOString()}</span>
          </Field>
          <div>
            <p className="ax-label">Action (canonical JSON)</p>
            <pre style={{
              borderRadius: 8,
              background: "var(--color-secondary)",
              padding: 12,
              fontSize: 12,
              overflowX: "auto",
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--color-border)",
            }}>
              {JSON.stringify(record.action, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="ax-label">{label}</p>
      <div style={{ fontSize: 13 }}>{children}</div>
    </div>
  );
}
