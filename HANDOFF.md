# HANDOFF — Session Context & Rename Log

## Rename: Intaglio → Intaglio (April 26, 2026)

> Historical references to "Intaglio" in old commits, session logs, and this file are historical record and not rewritten.

**Effective immediately:** Project renamed from Intaglio to **Intaglio**.
- Public domain: `intaglio.tech`
- APL acronym retained — now "Intaglio Policy Language" in documentation
- `.apl` file extension unchanged
- Git repo at `PabloPotato/Axon` renamed manually by operator after verification
- Vercel URLs unchanged until operator repoints DNS to `intaglio.tech`

---

## gstack Office Hours — Rename Forcing Questions

**Q1: What exactly are we doing?**
Renaming from "Axon" to "Intaglio". Same product, same policy language acronym, same codebase. Brand-only rename. Domain moves from old name not used to intaglio.tech (purchased). Metaphor shifts from "policies are tesserae in a mosaic" to "each audit record is permanently incised, like a copper engraving."

**Q2: What does success look like?**
All source files consistent: package names, import paths, landing copy, dashboard copy, docs, README files all say Intaglio. The .apl extension stays .apl. The APL acronym gets a footnote in docs explaining the historical name. Both landing and dashboard build with exit code 0. Engine test suite passes. HANDOFF.md documents which Intaglio references are intentional.

**Q3: What could go wrong?**
- npm package references to `@axon/` breaking the dashboard build
- Import paths `@axon/` in tsconfig/paths breaking module resolution
- Vercel deploy URLs being hardcoded in the dashboard config
- GitHub Actions CI triggering on `master` pushes during the rename
- The .apl fixtures referencing `Intaglio` in parser metadata causing engine test failures
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
2. Global search-and-replace across all non-binary files: `Intaglio` → `Intaglio` (case-sensitive, with exclusions)
3. Global replace `axon` → `intaglio` in package names, import paths, npm scopes
4. Add APL historical footnote in docs
5. Build + test verification
6. Merge `feature/design-v2` into `feature/rename-intaglio` with conflict resolution
7. Update DESIGN_V2.md, INSTITUTIONAL.md, ROADMAP.md with Intaglio metaphor
8. Push to GitHub

**Q6: What happens if the rename breaks a build?**
Two attempts to fix, then `git checkout master` and document the blocker here. Master never breaks.

---

## Known Intentional Intaglio References (post-rename)

| File | Reference | Reason |
|---|---|---|
| `.github/workflows/ci.yml` | axon-engine, x402-proxy | GitHub Actions job names — cosmetic only, not breaking |
| `apl/templates/*.apl` | (none expected) | Template content should use Intaglio in comments |
| `axon-engine/package.json` | @axon/engine | npm package name — will be renamed to @intaglio/engine |
| Git history | "Intaglio" in commit messages | Historical record — not rewritten |
| AGENTS.md | "Intaglio" in old references | Historical context preserved; top-level rename applied |
| `AXON_SIMULATOR_BYPASS` | Env var | Too risky to rename — consumers unknown |

---

## Blockers (if any)

(none yet)

---

## Follow-Up (post-rename)

- Obsidian vault integration at `~/.hermes/vault-design/` — post-hackathon
- Graphify knowledge graph integration — post-hackathon
- Vercel DNS repointing to `intaglio.tech` — operator action after rename verified
- GitHub repo rename from `PabloPotato/Axon` to `PabloPotato/Axon` — operator action
