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
- PR #1 opened at https://github.com/PabloPotato/Axon/pull/1
- PR title: "rename: Axon to Intaglio across codebase"
- Status: **Awaiting operator merge from GitHub UI**

### ✅ Priority Two — Deploy Gap Fix
- **Landing**: Redeployed successfully. Live at https://landing-gules-phi.vercel.app
  - Verified: serves "Intaglio" brand, "Policy and audit" hero, templates grid, comparison table
  - GitHub nav links to PabloPotato/Axon preserved intentionally
- **Dashboard**: Blocked by Vercel project configuration
  - Root directory issue: project was configured with `rootDirectory: dashboard` which creates path `dashboard/dashboard/`
  - Fixed `rootDirectory` to `null` via API
  - Build fails on Vercel because `@intaglio/engine` and `@intaglio/audit` are `file:../` workspace deps — Vercel's build environment doesn't have access to sibling directories when deploying a subdirectory project
  - **Operator action needed from phone:**
    1. Open https://vercel.com/axons-projects-61010da5/dashboard/settings
    2. Go to Git → Connected Git Repository → make sure it's linked to `PabloPotato/Axon` with Production Branch `master`
    3. Go to Deployments → hit "Redeploy" on the latest successful deployment
    4. OR: Set up Git integration so Vercel auto-deploys on push to master

### ✅ Priority Three — Metaphor Update
- DESIGN_V2.md: Updated with engraving/incision metaphor
- INSTITUTIONAL.md: Added Intaglio name etymology sentence
- ROADMAP.md: Updated header to Intaglio
- Committed as `4d73647` (included in rename commit)

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
