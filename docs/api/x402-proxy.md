# Axon x402-Proxy API Reference

The enforcement proxy evaluates all agent actions against active AI governance policies (APL) locally before making a `forward` or `deny` decision.

**Base URL**: `http://localhost:3001`

All routes require a Bearer token mapped directly to a registered Agent. The secret is securely hashed internally.

## Endpoints

### 1. Evaluate Action
Evaluates a specific agent action natively against its active APL context.

**Endpoint:** `POST /v1/actions`
**Authentication:** `Bearer <agent-secret>`

**Request Body**
```json
{
  "action": {
    "rail": "x402",
    "amount": { "value": 500, "currency": "USD" },
    "timestamp": "2026-04-19T22:00:00Z"
  }
}
```

**Headers**
- `Idempotency-Key` (optional): Unique string guaranteeing replay-safe evaluation.

**Response** (200 OK)
```json
{
  "decision": {
    "outcome": "APPROVE"
  },
  "record": {
    "record_id": "b78b4b2b-ccd1-4302-8634-87dfb305557d",
    "agent_id": "agent-uuid",
    "policy_hash": "sha256:...",
    "action": { ... },
    "self_hash": "sha256:...",
    "prev_record_hash": "sha256:..."
  }
}
```

If the action requires manual approval, `decision.outcome` will be `"REQUIRE_APPROVAL"` and a unique `approval_id` will be attached to the response.

### 2. Forward Request
Evaluates an action and forwards an arbitrary JSON request to the upstream target if (and only if) the action is natively approved. This is essentially evaluating inline with the target endpoint request.

**Endpoint:** `POST /v1/x402/forward`

**Request Body**
```json
{
  "action": { "rail": "x402", "amount": { "value": 50, "currency": "USD" } },
  "x402_request": {
    "target": "external-llm-service",
    "prompt": "Execute the wire transfer."
  }
}
```

### 3. Fetch Approval State
Fetch the localized status of a previously flagged `"REQUIRE_APPROVAL"` record.

**Endpoint:** `GET /v1/approvals/:id`

**Response** (200 OK)
```json
{
  "approval_id": "b78b4b2b-ccd1-4302-8634-87dfb305557d",
  "status": "APPROVED",
  "audit_record_id": "...",
  "requested_approver": "security-team",
  "timeout_at": "2026-04-20T22:00:00Z"
}
```
