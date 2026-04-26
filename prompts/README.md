# Axon — cheap-model prompts

These are the prompts you paste into **DeepSeek V3.1 web**, **Kimi K2**, **Cursor Composer**, **v0.dev**, or **Bolt.new** to do bulk work in parallel while Claude Code handles architecture, judgment calls, and security-critical code.

The rule: Claude writes the spec and reviews the output. The cheap models write the code.

## How to use

Each file is one self-contained prompt. Pick the target, paste, collect the output, drop it into the appropriate directory in this repo, then ask Claude to review.

| File                        | Target model / tool         | Output goes to            | Est. time   |
| --------------------------- | --------------------------- | ------------------------- | ----------- |
| `01-supabase-schema.md`     | DeepSeek V3.1 (web)         | `infra/supabase/`         | 10 min      |
| `02-dashboard-nextjs.md`    | Kimi K2 via Cursor Composer | `dashboard/`              | 30 min      |
| `03-landing-page-v0.md`     | v0.dev                      | `landing/`                | 15 min      |
| `04-x402-proxy.md`          | DeepSeek V3.1 (web)         | `services/x402-proxy/`    | 20 min      |

## Ground rules for reviewing cheap-model output

1. **Trust nothing about security.** Cheap models will happily ship insecure defaults. Grep for `allow-origin: *`, hardcoded secrets, missing auth on write endpoints, and disabled RLS.
2. **Check the imports are real.** DeepSeek and Kimi hallucinate package names occasionally. Run the install.
3. **Run it once locally before committing.** If it doesn't start, it isn't done.
4. **Make Claude review the business logic** — anything touching evaluation, audit, or money. The cheap models write the scaffolding; Claude writes the core.

## Parallel execution pattern

On a 5-hour Claude session, run all four cheap-model prompts in sequence in separate browser tabs while Claude works on the engine in the IDE. You can land a working dashboard + landing + proxy + schema in a single afternoon without burning Claude tokens on boilerplate.
