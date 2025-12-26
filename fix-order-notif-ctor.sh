#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ts(){ date +"%Y%m%d-%H%M%S"; }
BACKUP="$ROOT/_fix_order_notif_ctor_$(ts)"
mkdir -p "$BACKUP"

ORD_SVC="$ROOT/order-service/order-service/src/main/java/com/ecommerce/order/service/service/OrderService.java"
MSG_MODEL="$ROOT/order-service/order-service/src/main/java/com/ecommerce/order/service/model/NotificationMessage.java"
NOTIF_SH="$ROOT/notif.sh"

need() { [[ -f "$1" ]] || { echo "❌ Missing: $1"; exit 1; }; }
backup() {
  local f="$1"
  mkdir -p "$BACKUP/$(dirname "${f#$ROOT/}")"
  cp -a "$f" "$BACKUP/${f#$ROOT/}"
}

need "$ORD_SVC"
need "$MSG_MODEL"

echo "==> ROOT:   $ROOT"
echo "==> BACKUP: $BACKUP"
echo "==> Checking NotificationMessage constructor arity..."

# Count how many "private" fields exist (simple heuristic)
FIELD_COUNT="$(grep -E '^\s*private\s+' "$MSG_MODEL" | wc -l | tr -d ' ')"

echo "==> NotificationMessage private fields: $FIELD_COUNT"

backup "$ORD_SVC"
backup "$MSG_MODEL"

# If NotificationMessage has 4 fields, OrderService must pass 4 args.
if [[ "$FIELD_COUNT" -ge 4 ]]; then
  echo "==> Patching OrderService: add subject arg to NotificationMessage(...) calls"

  python3 - <<'PY'
import re, pathlib, sys

p = pathlib.Path("order-service/order-service/src/main/java/com/ecommerce/order/service/service/OrderService.java")
s = p.read_text(encoding="utf-8", errors="ignore")

# Replace constructor with 3 args:
# new NotificationMessage(
#    List.of("..."),
#    "+212...",
#    "message..."
# );
#
# -> add a subject as the 3rd arg, shift message to 4th.
def add_subject(match):
    a = match.group(1)  # first arg block
    b = match.group(2)  # second arg block
    c = match.group(3)  # third arg block (message)
    return f'new NotificationMessage(\n{a},\n{b},\n                    "Order notification",\n{c}\n            )'

pattern = re.compile(
    r'new\s+NotificationMessage\(\s*\n'
    r'(\s*.*?List\.of\([^\n]*\)\s*)\,\s*\n'
    r'(\s*.*?"[^"]*"\s*)\,\s*\n'
    r'(\s*.*?"[\s\S]*?"\s*)\n'
    r'\s*\)',
    re.M
)

new_s, n = pattern.subn(add_subject, s)

if n == 0:
    # fallback: very simple transform for common formatting
    # Find blocks with exactly 3 args inside new NotificationMessage( ... );
    pattern2 = re.compile(
        r'new\s+NotificationMessage\(\s*'
        r'([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\)',
        re.S
    )

    def add_subject2(m):
        return f'new NotificationMessage({m.group(1).strip()}, {m.group(2).strip()}, "Order notification", {m.group(3).strip()})'

    new_s, n = pattern2.subn(add_subject2, s)

if n == 0:
    print("❌ Could not find NotificationMessage(...) calls to patch in OrderService.java")
    sys.exit(1)

p.write_text(new_s, encoding="utf-8")
print(f"✅ Patched OrderService.java: updated {n} NotificationMessage(...) call(s)")
PY

else
  echo "==> NotificationMessage still has 3 fields. No constructor patch needed."
fi

# Optional: remove a stray standalone 'EOF' line in notif.sh (your error: EOF: command not found)
if [[ -f "$NOTIF_SH" ]]; then
  backup "$NOTIF_SH"
  if grep -qx 'EOF' "$NOTIF_SH"; then
    echo "==> Removing stray EOF line from notif.sh"
    # delete any line that is exactly EOF
    sed -i '/^EOF$/d' "$NOTIF_SH"
    echo "✅ notif.sh cleaned (removed stray EOF line)"
  fi
fi

echo
echo "✅ Done."
echo "Backups in: $BACKUP"
echo
echo "Now rebuild just order-service (or the whole stack):"
echo "  mvn -q -pl order-service -am clean package"
echo "or:"
echo "  docker compose up -d --build"
