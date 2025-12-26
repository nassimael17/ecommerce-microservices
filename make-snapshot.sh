#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

ts() { date +"%Y%m%d-%H%M%S"; }
OUT="$ROOT/project-snapshot_$(ts).txt"

# Helper: print section header
section() {
  echo
  echo "================================================================================"
  echo "## $1"
  echo "================================================================================"
}

# Helper: safely cat a file with header + line numbers
dump_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    echo
    echo "----- FILE: $f -----"
    # line numbers help a LOT when debugging together
    nl -ba "$f"
  fi
}

# Exclude big/noisy folders
EXCLUDES=(
  -path "*/node_modules/*" -o
  -path "*/target/*" -o
  -path "*/.git/*" -o
  -path "*/_fix_backups_*/*" -o
  -path "*/_ui_*/*" -o
  -name "*.jar" -o
  -name "*.jar.original" -o
  -name "*.class"
)

section "Snapshot meta"
{
  echo "ROOT=$ROOT"
  echo "DATE=$(date -Is)"
  echo "UNAME=$(uname -a || true)"
  echo "GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'no-git')"
  echo "GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo 'no-git')"
  echo "DOCKER=$(docker --version 2>/dev/null || echo 'no-docker')"
  echo "DOCKER_COMPOSE=$(docker compose version 2>/dev/null || echo 'no-docker-compose')"
} > "$OUT"

section "Project tree (trimmed)" >> "$OUT"
# tree might not exist everywhere; fallback to find
if command -v tree >/dev/null 2>&1; then
  tree -a -I "node_modules|target|.git|_fix_backups_*|_ui_*|*.jar|*.class" >> "$OUT"
else
  find . -maxdepth 5 \
    \( "${EXCLUDES[@]}" \) -prune -o -print >> "$OUT"
fi

section "docker-compose.yml" >> "$OUT"
dump_file "docker-compose.yml" >> "$OUT"
# also capture other compose variants if present
for f in docker-compose*.yml docker-compose*.yaml; do
  [[ -f "$f" && "$f" != "docker-compose.yml" ]] && dump_file "$f" >> "$OUT"
done

section "Key configs (application.yml / properties)" >> "$OUT"
while IFS= read -r f; do dump_file "$f" >> "$OUT"; done < <(
  find . \( "${EXCLUDES[@]}" \) -prune -o \
    -type f \( -name "application.yml" -o -name "application.yaml" -o -name "*.properties" \) -print | sort
)

section "Maven (pom.xml)" >> "$OUT"
while IFS= read -r f; do dump_file "$f" >> "$OUT"; done < <(
  find . \( "${EXCLUDES[@]}" \) -prune -o -type f -name "pom.xml" -print | sort
)

section "RabbitMQ / Notification / Order Java sources (filtered)" >> "$OUT"
# Focus on the likely relevant Java files first
while IFS= read -r f; do dump_file "$f" >> "$OUT"; done < <(
  find . \( "${EXCLUDES[@]}" \) -prune -o -type f -name "*.java" -print | \
    grep -Ei "(rabbit|amqp|notification|listener|producer|queue|exchange|Order|ConfigServer|Eureka|Gateway|Feign|Resilience4j)" | sort || true
)

section "All remaining backend source files (java/yml/xml)" >> "$OUT"
while IFS= read -r f; do dump_file "$f" >> "$OUT"; done < <(
  find . \( "${EXCLUDES[@]}" \) -prune -o \
    -type f \( -name "*.java" -o -name "*.yml" -o -name "*.yaml" -o -name "*.properties" -o -name "*.xml" \) -print | sort
)

section "Frontend important files (NO node_modules)" >> "$OUT"
while IFS= read -r f; do dump_file "$f" >> "$OUT"; done < <(
  find ecommerce-dashboard \
    -path "*/node_modules/*" -prune -o \
    -type f \( -name "*.ts" -o -name "*.html" -o -name "*.scss" -o -name "*.json" -o -name "*.md" \) -print 2>/dev/null | sort
)

section "Runtime checks (containers + rabbitmq health)" >> "$OUT"
{
  echo "+ docker compose ps"
  docker compose ps 2>&1 || true
  echo
  echo "+ docker compose config (rendered)"
  docker compose config 2>&1 || true
  echo
  echo "+ rabbitmq container status (if present)"
  # try common service/container names
  for name in rabbitmq ecommerce-microservices-rabbitmq-1 rabbitmq-1; do
    if docker ps --format '{{.Names}}' | grep -qx "$name"; then
      echo "Found container: $name"
      docker exec "$name" rabbitmq-diagnostics ping 2>&1 || true
      docker exec "$name" rabbitmqctl status 2>&1 || true
    fi
  done
} >> "$OUT"

section "Docker logs (tail 400 per service)" >> "$OUT"
{
  # If compose is available, get service list and pull logs
  if docker compose ps >/dev/null 2>&1; then
    services="$(docker compose ps --services 2>/dev/null || true)"
    for s in $services; do
      echo
      echo "----- LOGS: service=$s (tail 400) -----"
      docker compose logs --no-color --tail 400 "$s" 2>&1 || true
    done
  else
    echo "docker compose not available, skipping compose logs"
  fi
} >> "$OUT"

section "DONE" >> "$OUT"
echo "✅ Snapshot created: $OUT"
echo "Tip: upload that .txt here and I’ll trace RabbitMQ + notification end-to-end."
