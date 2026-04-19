// dashboard/app/app/agents/[slug]/AgentTabs.tsx
// Client Component — tabs for Policy (Monaco), Audit, Approvals, Settings.
// All data is passed from the Server Component as props (no client fetching).

"use client";

import { useState, useTransition } from "react";
import { formatRelativeTime, truncateHash } from "@/lib/utils";
import dynamic from "next/dynamic";

// Monaco loads only client-side
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
      Loading editor…
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

const TABS = ["Overview", "Policy", "Audit", "Approvals", "Settings"] as const;
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

  return (
    <div>
      {/* Tab row */}
      <div className="flex items-center gap-0.5 border-b border-border mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            id={`agent-tab-${t.toLowerCase()}`}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {t === "Approvals" && approvals.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs w-4 h-4">
                {approvals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total actions" value={auditRecords.length} />
          <StatCard
            label="Active policy"
            value={activePolicy ? `v${activePolicy.version}` : "None"}
            mono
          />
          <StatCard label="Pending approvals" value={approvals.length} />
        </div>
      )}

      {/* Policy */}
      {tab === "Policy" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <MonacoEditor
              height="360px"
              defaultLanguage="plaintext"
              value={policySource}
              onChange={(v) => setPolicySource(v ?? "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "\"Geist Mono\", \"JetBrains Mono\", monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              id="policy-save-btn"
              onClick={handleSavePolicy}
              disabled={savingPolicy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {savingPolicy ? "Saving…" : "Save new version"}
            </button>
            {saveResult && (
              <span className={`text-sm ${saveResult.startsWith("Error") ? "text-destructive" : "text-green-400"}`}>
                {saveResult}
              </span>
            )}
          </div>
          {/* Version history */}
          {policies.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Version history</h3>
              <div className="space-y-1">
                {policies.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-md hover:bg-secondary/30"
                  >
                    <span className={`font-mono ${p.active ? "text-green-400" : "text-muted-foreground"}`}>
                      v{p.version}{p.active ? " (active)" : ""}
                    </span>
                    <span className="text-muted-foreground font-mono">{truncateHash(p.hash)}</span>
                    <span className="text-muted-foreground ml-auto">{formatRelativeTime(p.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit */}
      {tab === "Audit" && (
        <div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Decision</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Hash</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {auditRecords.map((r) => {
                  const decision = r.decision as { outcome: string; reason?: string };
                  return (
                    <tr
                      key={r.id}
                      id={`audit-row-${r.id}`}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedRecord(r)}
                    >
                      <td className="px-4 py-3">
                        <OutcomeBadge outcome={decision.outcome} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {truncateHash(r.self_hash)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatRelativeTime(r.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {auditRecords.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No audit records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Side sheet */}
          {selectedRecord && (
            <AuditSheet record={selectedRecord} onClose={() => setSelectedRecord(null)} />
          )}
        </div>
      )}

      {/* Approvals */}
      {tab === "Approvals" && (
        <div className="space-y-3">
          {approvals.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending approvals.</p>
          )}
          {approvals.map((ap) => (
            <div key={ap.id} id={`approval-${ap.id}`} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground">{ap.id.slice(0, 8)}…</p>
                {ap.requested_approver && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Approver: {ap.requested_approver}
                  </p>
                )}
                {ap.timeout_at && (
                  <p className="text-xs text-amber-400 mt-0.5">
                    Times out: {formatRelativeTime(ap.timeout_at)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  id={`approve-btn-${ap.id}`}
                  onClick={() => handleDecision(ap.id, "approved")}
                  disabled={isPending}
                  className="rounded-md bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  id={`deny-btn-${ap.id}`}
                  onClick={() => handleDecision(ap.id, "denied")}
                  disabled={isPending}
                  className="rounded-md bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === "Settings" && (
        <div className="max-w-sm space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Display name</label>
            <input
              id="agent-display-name"
              defaultValue={agent.display_name}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Agent ID</label>
            <input
              readOnly
              value={agent.id}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm font-mono text-muted-foreground cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Agent settings editing coming in v0.2.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${mono ? "font-mono text-base" : ""}`}>{value}</p>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; class: string }> = {
    APPROVE: { label: "Approved", class: "bg-green-500/10 text-green-400" },
    DENY: { label: "Denied", class: "bg-red-500/10 text-red-400" },
    REQUIRE_APPROVAL: { label: "Pending", class: "bg-amber-500/10 text-amber-400" },
  };
  const style = map[outcome] ?? { label: outcome, class: "bg-secondary text-muted-foreground" };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
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
    <div
      className="fixed inset-0 z-50 flex justify-end"
      id="audit-detail-sheet"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-card border-l border-border overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Audit Record</h2>
          <button
            id="audit-sheet-close"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <Field label="Outcome">
            <OutcomeBadge outcome={decision.outcome} />
          </Field>
          {decision.reason && (
            <Field label="Reason">
              <span className="font-mono text-xs">{decision.reason}</span>
            </Field>
          )}
          <Field label="Self hash">
            <span className="font-mono text-xs break-all">{record.self_hash}</span>
          </Field>
          <Field label="Prev hash">
            <span className="font-mono text-xs break-all">{record.prev_record_hash}</span>
          </Field>
          <Field label="Timestamp">
            {new Date(record.created_at).toISOString()}
          </Field>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Action (canonical JSON)</p>
            <pre className="rounded-md bg-secondary p-3 text-xs overflow-x-auto font-mono">
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
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
