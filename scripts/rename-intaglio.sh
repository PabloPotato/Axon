#!/bin/bash
# rename-intaglio.sh — Mechanical rename: Intaglio → Intaglio
# Run from repo root. Excludes node_modules, .git, dist, .next, coverage

set -e
cd /root/axon/Intaglio-main

EXCLUDE_PATHS='! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*"'

echo "=== PHASE 1: Replace 'Intaglio' → 'Intaglio' (case-sensitive capitalized) in markdown/doc files ==="
find . -type f \( -name "*.md" -o -name "*.txt" -o -name "*.yml" -o -name "*.yaml" -o -name "*.sql" -o -name "*.sh" -o -name "*.css" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i 's/\bAxon\b/Intaglio/g' {} +

echo "=== PHASE 2A: Replace 'Intaglio' → 'Intaglio' in package.json names ==="
find . -name "package.json" \
  ! -path "*/node_modules/*" \
  -exec sed -i 's/"Intaglio"/"Intaglio"/g' {} +

echo "=== PHASE 2B: Replace '@axon/' → '@intaglio/' in package.json ==="
find . -name "package.json" \
  ! -path "*/node_modules/*" \
  -exec sed -i 's/"@axon\//"@intaglio\//g' {} +

echo "=== PHASE 3A: Replace '@axon/' → '@intaglio/' in TS/JSON/JS files ==="
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i 's/@axon\//@intaglio\//g' {} +

echo "=== PHASE 3B: Replace axon- prefix in import paths (from, require) ==="
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i 's|from "axon-|from "intaglio-|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i "s|from 'axon-|from 'intaglio-|g" {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i 's|require("axon-|require("intaglio-|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i "s|require('axon-|require('intaglio-|g" {} +

echo "=== PHASE 3C: Replace lowercase 'axon' word boundary in source files ==="
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" ! -path "*/coverage/*" \
  -exec sed -i 's/\baxon\b/intaglio/g' {} +

echo "=== PHASE 4: Rename directories ==="
if [ -d "axon-engine" ] && [ ! -d "intaglio-engine" ]; then
  mv axon-engine intaglio-engine
  echo "Renamed: axon-engine/ → intaglio-engine/"
fi
if [ -d "axon-audit" ] && [ ! -d "intaglio-audit" ]; then
  mv axon-audit intaglio-audit
  echo "Renamed: axon-audit/ → intaglio-audit/"
fi

echo "=== PHASE 5: Handle .apl file content — replace Intaglio reference in comments only ==="
find . -name "*.apl" ! -path "*/node_modules/*" ! -path "*/.git/*" \
  -exec sed -i 's/\bAxon\b/Intaglio/g' {} +

echo "=== DONE ==="
