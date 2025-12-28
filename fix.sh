#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT="$ROOT/ecommerce-dashboard"

echo "==> ROOT:  $ROOT"
echo "==> FRONT: $FRONT"

MODELS="$(find "$FRONT/src" -type f \( -name "api.models.ts" -o -name "api.models.*.ts" \) 2>/dev/null | head -n 1 || true)"
if [[ -z "${MODELS:-}" ]]; then
  MODELS="$(grep -Rsl --include="*.ts" "export interface Order" "$FRONT/src" | head -n 1 || true)"
fi

if [[ -z "${MODELS:-}" ]]; then
  echo "❌ Could not find api.models.ts (or a file containing 'export interface Order') under $FRONT/src"
  exit 1
fi

echo "==> Models file: $MODELS"

# Backup
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/_fix_totalPrice_$TS"
mkdir -p "$BACKUP"
cp -a "$MODELS" "$BACKUP/$(basename "$MODELS")"
echo "==> Backup saved: $BACKUP/$(basename "$MODELS")"

# If Order already has totalPrice, do nothing (inside the Order block)
python3 - "$MODELS" <<'PY'
import re, sys, pathlib

path = pathlib.Path(sys.argv[1])
txt = path.read_text(encoding="utf-8", errors="ignore")

m = re.search(r"(export\s+interface\s+Order\s*\{)(.*?)(\n\})", txt, flags=re.S)
if not m:
    print("❌ Could not find 'export interface Order { ... }' block.")
    sys.exit(2)

head, body, tail = m.group(1), m.group(2), m.group(3)

# Already present?
if re.search(r"^\s*totalPrice\s*\??\s*:", body, flags=re.M):
    print("✅ totalPrice already exists in Order model. Nothing to do.")
    sys.exit(0)

lines = body.splitlines()

# choose insertion point
insert_idx = None
for i, line in enumerate(lines):
    if re.search(r"\bquantity\s*\??\s*:", line):
        insert_idx = i + 1
        break

if insert_idx is None:
    for i, line in enumerate(lines):
        if re.search(r"\bstatus\s*\??\s*:", line):
            insert_idx = i
            break

if insert_idx is None:
    insert_idx = len(lines)

# detect indentation
indent = "  "
for line in lines:
    if line.strip():
        indent = re.match(r"\s*", line).group(0)
        break

lines.insert(insert_idx, f"{indent}totalPrice?: number | null;")

new_body = "\n".join(lines)
new_txt = txt[:m.start()] + head + new_body + tail + txt[m.end():]
path.write_text(new_txt, encoding="utf-8")

print("✅ Patched Order model: added totalPrice?: number | null;")
PY

echo
echo "NEXT:"
echo "  cd $FRONT"
echo "  npm start"
