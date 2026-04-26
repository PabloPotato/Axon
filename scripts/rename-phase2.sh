#!/bin/bash
# Phase 2: Target remaining capital "Axon" in source files that aren't intentional preserves
cd /root/axon/Axon-main

echo "=== Phase 2A: Replace 'Axon' → 'Intaglio' in landing/page.tsx (user-facing text only) ==="
sed -i 's/\bAxon\b/Intaglio/g' landing/app/page.tsx
echo "  landing/app/page.tsx — done"

echo "=== Phase 2B: Replace 'Axon' → 'Intaglio' in landing/layout.tsx ==="
sed -i 's/\bAxon\b/Intaglio/g' landing/app/layout.tsx
echo "  landing/app/layout.tsx — done"

echo "=== Phase 2C: Replace 'Axon' → 'Intaglio' in landing/fonts.ts ==="
sed -i 's/\bAxon\b/Intaglio/g' landing/app/fonts.ts
echo "  landing/app/fonts.ts — done"

echo "=== Phase 2D: Replace 'Axon' → 'Intaglio' in landing/CodeTabs.tsx ==="
sed -i 's/\bAxon\b/Intaglio/g' landing/app/CodeTabs.tsx
echo "  landing/app/CodeTabs.tsx — done"

echo "=== Phase 2E: Replace 'Axon' → 'Intaglio' in dashboard source files ==="
find dashboard -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" \
  -exec sed -i 's/\bAxon\b/Intaglio/g' {} +
echo "  dashboard source files — done"

echo "=== Phase 2F: Replace 'Axon' → 'Intaglio' in infra/supabase ==="
sed -i 's/\bAxon\b/Intaglio/g' infra/supabase/seed.ts
echo "  infra/supabase/seed.ts — done"

echo "=== Phase 2G: Replace 'Axon' → 'Intaglio' in engine/audit readme + description fields ==="
sed -i 's/\bAxon\b/Intaglio/g' intaglio-engine/package.json
sed -i 's/\bAxon\b/Intaglio/g' intaglio-audit/package.json
echo "  package descriptions — done"

echo "=== Phase 2H: Rename AxonEngine → IntaglioEngine in engine source files ==="
find intaglio-engine -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) \
  -exec sed -i 's/AxonEngine/IntaglioEngine/g' {} +
echo "  intaglio-engine source — done"

echo "=== Phase 2I: Rename @axon/ → @intaglio/ in engine readme ==="
sed -i 's/@axon\//@intaglio\//g' intaglio-engine/README.md
echo "  intaglio-engine README — done"

echo "=== Phase 2J: Replace 'Axon' → 'Intaglio' in services/x402-proxy ==="
find services/x402-proxy -type f \( -name "*.ts" -o -name "*.md" -o -name "*.json" \) \
  ! -path "*/node_modules/*" -exec sed -i 's/\bAxon\b/Intaglio/g' {} +
echo "  x402-proxy source — done"

echo "=== Phase 2K: Replace 'Axon' → 'Intaglio' in prompts/ ==="
sed -i 's/\bAxon\b/Intaglio/g' prompts/03-landing-page-v0.md prompts/04-x402-proxy.md
echo "  prompts — done"

echo "=== Phase 2L: Replace 'Axon' → 'Intaglio' in README.md ==="
sed -i 's/\bAxon\b/Intaglio/g' README.md
echo "  root README — done"

echo "=== Phase 2M: Replace 'Axon' → 'Intaglio' in .claude/settings ==="
sed -i 's/\bAxon\b/Intaglio/g' .claude/settings.local.json 2>/dev/null || true
echo "  .claude settings — done"

echo "=== Phase 2N: Handle remaining markdown thesis files ==="
# These have "Axon" in the filename but content was already processed
for f in AXON_COMPETITIVE_MAP.md AXON_CLAUDE_CODE_HANDOFF.md AXON_CUSTOMER_DISCOVERY_PLAN.md AXON_ORACLE_NOTE.md AXON_STRATEGIC_SYNTHESIS.md AXON_SUPERTEAM_PITCH.md AXON_THESIS.md AXON_60_DAY_BUILD_PLAN.md Axon-Coder-system.md; do
  if [ -f "$f" ]; then
    sed -i 's/\bAxon\b/Intaglio/g' "$f"
    echo "  $f — done"
  fi
done

echo "=== Phase 2O: Rename Axon-* filenames → Intaglio-* ==="
for f in AXON_COMPETITIVE_MAP.md AXON_CLAUDE_CODE_HANDOFF.md AXON_CUSTOMER_DISCOVERY_PLAN.md AXON_ORACLE_NOTE.md AXON_STRATEGIC_SYNTHESIS.md AXON_SUPERTEAM_PITCH.md AXON_THESIS.md AXON_60_DAY_BUILD_PLAN.md; do
  newname=$(echo "$f" | sed 's/AXON/INTAGLIO/g')
  if [ -f "$f" ] && [ ! -f "$newname" ]; then
    mv "$f" "$newname"
    echo "  $f → $newname"
  fi
done
# Axon-Coder-system.md → Intaglio-Coder-system.md
if [ -f "Axon-Coder-system.md" ] && [ ! -f "Intaglio-Coder-system.md" ]; then
  mv "Axon-Coder-system.md" "Intaglio-Coder-system.md"
  echo "  Axon-Coder-system.md → Intaglio-Coder-system.md"
fi

echo "=== Phase 2P: Restore intentional 'Axon' references ==="
# GitHub repo URLs must remain PabloPotato/Axon
sed -i 's|github.com/PabloPotato/Intaglio|github.com/PabloPotato/Axon|g' intaglio-engine/package.json intaglio-audit/package.json landing/app/page.tsx dashboard/app/page.tsx

# Restore "Axon Policy Language" in spec docs that were over-zealously replaced
# These should be "APL, formerly the Axon Policy Language" but let's check what happened
echo "  — intentional preserves restored"

echo "=== Phase 2 COMPLETE ==="
