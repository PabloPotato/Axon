// Template verification script
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AxonEngine } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, "../../apl/templates");

const templates = [
  "01-per-transaction", "02-per-day", "03-velocity", "04-allowlist", "05-blocklist",
  "06-time-window", "07-risk-score", "08-usdc-treasury", "09-domestic-only", "10-combined-compliance"
];

let passed = 0;
let failed = 0;

for (const name of templates) {
  try {
    const source = readFileSync(join(templatesDir, name + ".apl"), "utf8");
    const engine = new AxonEngine(source);
    const policy = engine.getPolicy();
    console.log("OK:", policy.id);
    passed++;
  } catch (err) {
    console.log("FAIL:", name, "-", err.message);
    failed++;
  }
}

console.log(`\\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
