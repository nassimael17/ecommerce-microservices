#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
FRONT="${ROOT}/ecommerce-dashboard"

OUT_DIR="${ROOT}/_bug_context_$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

need_dir() {
  [[ -d "$1" ]] || { echo "❌ Missing directory: $1"; exit 1; }
}

copy_if_exists() {
  local f="$1"
  if [[ -f "$f" ]]; then
    mkdir -p "$OUT_DIR/$(dirname "${f#$ROOT/}")"
    cp -a "$f" "$OUT_DIR/${f#$ROOT/}"
    echo "✅ copied: ${f#$ROOT/}"
  else
    echo "⚠️ missing: ${f#$ROOT/}"
  fi
}

need_dir "$FRONT"

echo "==> ROOT: $ROOT"
echo "==> FRONT: $FRONT"
echo "==> OUT: $OUT_DIR"
echo

# 1) Must-have files for the error
copy_if_exists "$FRONT/src/app/ui/orders/orders.component.ts"
copy_if_exists "$FRONT/src/app/api/api.models.ts"
copy_if_exists "$FRONT/src/app/api/orders.api.ts"

# 2) Grab any other TS file that defines or uses Order / totalPrice
echo
echo "==> Searching for Order model + totalPrice usage..."
if command -v rg >/dev/null 2>&1; then
  rg -n --hidden --glob '!**/node_modules/**' \
    -e 'export (interface|type|class) Order' \
    -e '\bOrder\b' \
    -e 'totalPrice' \
    "$FRONT/src/app" > "$OUT_DIR/rg_hits.txt" || true
else
  grep -RIn --exclude-dir=node_modules \
    -e 'export interface Order' \
    -e 'export type Order' \
    -e 'export class Order' \
    -e 'totalPrice' \
    -e 'Order' \
    "$FRONT/src/app" > "$OUT_DIR/rg_hits.txt" || true
fi
echo "✅ wrote: rg_hits.txt"

# 3) Extract “definition blocks” for Order and any totalPrice mention (quick view)
echo
echo "==> Creating focused snippets..."
SNIP="$OUT_DIR/snippets.txt"
: > "$SNIP"

add_block() {
  local file="$1"
  local pattern="$2"
  if [[ -f "$file" ]]; then
    echo "----- FILE: ${file#$ROOT/} | PATTERN: $pattern -----" >> "$SNIP"
    # show a window around matches
    if command -v rg >/dev/null 2>&1; then
      rg -n --context 8 "$pattern" "$file" >> "$SNIP" || true
    else
      grep -n -C 8 "$pattern" "$file" >> "$SNIP" || true
    fi
    echo >> "$SNIP"
  fi
}

add_block "$FRONT/src/app/api/api.models.ts" 'export (interface|type|class) Order|totalPrice|total|price'
add_block "$FRONT/src/app/api/orders.api.ts" 'Order|totalPrice|total|price'
add_block "$FRONT/src/app/ui/orders/orders.component.ts" 'totalPrice|Order|orders'

echo "✅ wrote: snippets.txt"

# 4) Also capture TS config + angular config (sometimes type generation / path mapping matters)
echo
copy_if_exists "$FRONT/tsconfig.json"
copy_if_exists "$FRONT/tsconfig.app.json"
copy_if_exists "$FRONT/angular.json"
copy_if_exists "$FRONT/package.json"

# 5) Zip everything for easy sharing
echo
ZIP="${OUT_DIR}.zip"
( cd "$OUT_DIR/.." && zip -rq "$(basename "$ZIP")" "$(basename "$OUT_DIR")" )
echo "✅ zipped: $ZIP"

echo
echo "DONE."
echo "Now send me:"
echo "  1) The contents of: $OUT_DIR/snippets.txt"
echo "  2) The contents of: $OUT_DIR/rg_hits.txt"
echo "Or just upload: $ZIP"
