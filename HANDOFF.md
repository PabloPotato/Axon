# HANDOFF — Session Context & Rename Log

## Rename: Axon → Intaglio (April 26, 2026)

> Historical references to "Axon" in old commits, session logs, and this file are historical record and not rewritten.

**Effective immediately:** Project renamed from Axon to **Intaglio**.
- Public domain: `intaglio.tech`
- APL acronym retained — now "Intaglio Policy Language" in documentation
- `.apl` file extension unchanged
- Git repo at `PabloPotato/Axon` renamed manually by operator after verification
- Vercel URLs unchanged until operator repoints DNS to `intaglio.tech`

---

## Execution Log (April 26, 2026)

### ✅ Priority One — Push & PR
- Git push of `feature/rename-intaglio` (commit `4d73647`) to GitHub — succeeded
- PR #1 opened at https://github.com/PabloPotato/Intaglio/pull/1
- PR title: "rename: Axon to Intaglio across codebase"
- Note: The operator already renamed the GitHub repo from PabloPotato/Axon to PabloPotato/Intaglio. Remote updated locally.
- Status: **Awaiting operator merge from GitHub UI**

### ✅ Priority Two — Vercel Deploy Gap (Round 2 — April 26)
- **Landing**: Redeployed twice. First deploy served rename + Design v2. Second deploy serves OpenClaw structural improvements (updated hero copy + "Why Intaglio is different" cards). Live at https://landing-gules-phi.vercel.app
  - Verified: hero reads "The policy layer for the autonomous economy." with subhead "Open standard · Deterministic compliance · Multi-rail ready"
  - "Why Intaglio is different" section added with 3 icon cards (Lock, Zap, Globe)
  - All existing sections preserved (hash chain, templates, institutional, regulatory table, comparison table, policy editor)
- **Dashboard**: Fixed by inlining engine and audit source into dashboard/lib/
  - Engine source (5 files, 648 lines) copied to dashboard/lib/intaglio-engine/
  - Audit source (5 files, 866 lines) copied to dashboard/lib/intaglio-audit/
  - All @intaglio/* imports replaced with relative paths to lib/
  - file: deps removed from package.json
  - tsconfig paths for @intaglio/* removed
  - next.config.ts updated to trace local lib/ files
  - Local build passes clean
  - Branch: feature/dashboard-deploy-fix (pushed)
  - **Vercel deploy blocked** by CLI bug: Vercel project has rootDirectory="dashboard" but CLI resolves path as dashboard/dashboard/ when deploying from that subdirectory. API deploy with gitSource needs repoId (no git integration connected).
  - **Operator action needed tomorrow:**
    1. Open https://vercel.com/axons-projects-61010da5/dashboard/settings
    2. Set Root Directory to "dashboard"
    3. Go to Deployments → click "..." on latest → "Redeploy"
    4. OR: during demo, run `cd dashboard && npm run dev` on localhost and share screen

### ✅ Priority Three — Metaphor Update (done in previous run)
- DESIGN_V2.md, INSTITUTIONAL.md, ROADMAP.md updated with Intaglio engraving metaphor
- Committed as part of `4d73647` rename

### ✅ Priority Three (Round 2) — OpenClaw Merge
- Hero copy updated: "The policy layer for the autonomous economy." with breadcrumb subhead
- New "Why Intaglio is different" section with 3 icon cards using lucide-react
- Policy editor verified working
- All existing untouched sections preserved
- globals.css: no color token changes, only new class additions
- Build clean: 7.56 kB, 0 errors
- Branch: feature/dashboard-deploy-fix (contains both dashboard fix + landing OpenClaw merge)
- Landing live at https://landing-gules-phi.vercel.app

---

## gstack Office Hours — Rename Forcing Questions

**Q1: What exactly are we doing?**
Renaming from "Axon" to "Intaglio". Same product, same policy language acronym, same codebase. Brand-only rename. Domain moves from axon.sh (unpurchased) to intaglio.tech (purchased). Metaphor shifts from "policies are tesserae in a mosaic" to "each audit record is permanently incised, like a copper engraving."

**Q2: What does success look like?**
All source files consistent: package names, import paths, landing copy, dashboard copy, docs, README files all say Intaglio. The .apl extension stays .apl. The APL acronym gets a footnote in docs explaining the historical name. Both landing and dashboard build with exit code 0. Engine test suite passes. HANDOFF.md documents which Axon references are intentional.

**Q3: What could go wrong?**
- npm package references to `@axon/` breaking the dashboard build
- Import paths `@axon/` in tsconfig/paths breaking module resolution
- Vercel deploy URLs being hardcoded in the dashboard config
- GitHub Actions CI triggering on `master` pushes during the rename
- The .apl fixtures referencing `Axon` in parser metadata causing engine test failures
- SECURITY.md or AGENTS.md referencing `AXON_` env vars that aren't being updated

**Q4: What does NOT change?**
- `.apl` file extension
- APL acronym (gets historical footnote only)
- GitHub repo name (operator renames manually)
- Vercel project IDs and deploy URLs
- `AXON_SIMULATOR_BYPASS` env var name (too risky to change without verifying all consumers)
- Git history (no rewriting)

**Q5: What is the order of operations?**
1. Write HANDOFF.md (this file)
2. Global search-and-replace across all non-binary files: `Axon` → `Intaglio` (case-sensitive, with exclusions)
3. Global replace `axon` → `intaglio` in package names, import paths, npm scopes
4. Add APL historical footnote in docs
5. Build + test verification
6. Merge `feature/design-v2` into `feature/rename-intaglio` with conflict resolution
7. Update DESIGN_V2.md, INSTITUTIONAL.md, ROADMAP.md with Intaglio metaphor
8. Push to GitHub

**Q6: What happens if the rename breaks a build?**
Two attempts to fix, then `git checkout master` and document the blocker here. Master never breaks.

---

## Known Intentional Axon References (post-rename)

| File | Reference | Reason |
|---|---|---|
| `.github/workflows/ci.yml` | axon-engine, x402-proxy | GitHub Actions job names — cosmetic only, not breaking |
| `apl/templates/*.apl` | (none expected) | Template content should use Intaglio in comments |
| Git history | "Axon" in commit messages | Historical record — not rewritten |
| AGENTS.md | "Axon" in env var references | Historical context preserved; top-level rename applied |
| `AXON_SIMULATOR_BYPASS` | Env var | Too risky to rename — consumers unknown |
| GitHub URLs | `PabloPotato/Axon` | Repo name stays until operator renames manually |

---

## Blockers (if any)

**BLOCKER: Dashboard Vercel deploy** — The project `dashboard-lilac-five-43.vercel.app` has `rootDirectory: dashboard` in its Vercel settings, which conflicts with the `file:` workspace deps to `../intaglio-engine` and `../intaglio-audit`. The Vercel CLI deploy from the `dashboard/` subdirectory can't resolve these. Fix requires either:
- (Recommended) Set up GitHub integration on Vercel so it deploys from the full repo, then Vercel can resolve workspace `file:` deps via root `package.json` install
- Or: Restore the previous working Vercel deployment by hitting Redeploy on the last successful build in the Vercel UI
- Or: Publish `@intaglio/engine` and `@intaglio/audit` to npm and update `dashboard/package.json` to use published versions

---

## Follow-Up (post-rename)

- Obsidian vault integration at `~/.hermes/vault-design/` — post-hackathon
- Graphify knowledge graph integration — post-hackathon
- Vercel DNS repointing to `intaglio.tech` — operator action after rename verified
- GitHub repo rename from `PabloPotato/Axon` to `PabloPotato/Intaglio` — operator action
- Dashboard Vercel deploy via GitHub integration — operator action
