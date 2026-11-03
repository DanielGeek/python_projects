#!/usr/bin/env bash
# Arcade Vault: move the dev Supabase schema to the production project.
# Run it yourself (Claude is denied from reading .env.prod and from running this script).
#
#   ./scripts/supabase-prod.sh check       connection + is rls_auto_enable() there + applied migrations
#   ./scripts/supabase-prod.sh bootstrap   create rls_auto_enable() and the ensure_rls event trigger if missing
#   ./scripts/supabase-prod.sh dry-run     list the migrations that `push` would apply
#   ./scripts/supabase-prod.sh push        apply them
#   ./scripts/supabase-prod.sh verify      compare prod with references/production/verify-prod.expected
#
# Add --yes to skip the y/N question of bootstrap and push.
# Reads only three keys from .env.prod (it is never sourced, since values such as
# CONTACT_FROM_EMAIL=Arcade Vault <...> are not valid shell):
#   NEXT_PUBLIC_SUPABASE_URL   https://<prod-ref>.supabase.co
#   SUPABASE_DB_PASSWORD       database password of the production project
#   SUPABASE_PROD_DB_URL       optional full connection string (Session pooler) when your network has no IPv6
set -euo pipefail
set +x

DEV_REF="sxwaixbuvhubktrkktnx"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROD_ENV_FILE:-$ROOT/.env.prod}"
DIR="$ROOT/references/production"

cmd="${1:-}"
yes=0
for a in "$@"; do [ "$a" = "--yes" ] && yes=1; done

die() { echo "ERROR: $*" >&2; exit 1; }

get_var() {
  # last KEY=value line, without CR and without surrounding quotes
  local v
  v="$(grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- | tr -d '\r' || true)"
  v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
  printf '%s' "$v"
}

case "$cmd" in check|bootstrap|dry-run|push|verify) ;; *)
  sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
  exit 2 ;;
esac

command -v psql >/dev/null || die "psql not found (brew install libpq)"
[ -f "$ENV_FILE" ] || die ".env.prod not found at $ENV_FILE"

SUPA_URL="$(get_var NEXT_PUBLIC_SUPABASE_URL)"
DB_PASS="$(get_var SUPABASE_DB_PASSWORD)"
POOLER_URL="$(get_var SUPABASE_PROD_DB_URL)"

REF="$(printf '%s' "$SUPA_URL" | sed -nE 's#^https://([a-z0-9]+)\.supabase\.co/?$#\1#p')"
[ -n "$REF" ] || die "NEXT_PUBLIC_SUPABASE_URL in .env.prod is missing or is not https://<ref>.supabase.co"
[ "$REF" != "$DEV_REF" ] || die "NEXT_PUBLIC_SUPABASE_URL in .env.prod points to the DEV project ($DEV_REF). Refusing to continue."

if [ -n "$POOLER_URL" ]; then
  case "$POOLER_URL" in
    *"$DEV_REF"*) die "SUPABASE_PROD_DB_URL contains the DEV project ref. Refusing to continue." ;;
    *"$REF"*) ;;
    *) die "SUPABASE_PROD_DB_URL does not contain the production ref ($REF)." ;;
  esac
  DB_URL="$POOLER_URL"
else
  [ -n "$DB_PASS" ] || die "SUPABASE_DB_PASSWORD is empty in .env.prod"
  ENC="$(PW="$DB_PASS" python3 -c 'import os,urllib.parse;print(urllib.parse.quote(os.environ["PW"],safe=""))')"
  DB_URL="postgresql://postgres:${ENC}@db.${REF}.supabase.co:5432/postgres"
fi

PSQL=(psql "$DB_URL" -X -v ON_ERROR_STOP=1 -At -F '|')

confirm() {
  echo "Target: PRODUCTION project $REF"
  [ "$yes" = 1 ] && return 0
  [ -t 0 ] || die "no terminal to ask for confirmation; run it again with --yes"
  read -r -p "$1 [y/N] " ans
  [ "$ans" = "y" ] || [ "$ans" = "Y" ] || die "cancelled"
}

has_bootstrap() {
  local out
  out="$("${PSQL[@]}" -c "select (to_regproc('public.rls_auto_enable') is not null)::text || ',' || exists(select 1 from pg_event_trigger where evtname='ensure_rls')::text")"
  [ "$out" = "true,true" ]
}

case "$cmd" in
  check)
    echo "Target: PRODUCTION project $REF"
    "${PSQL[@]}" -c "select current_database()" >/dev/null || die "cannot connect (no IPv6? set SUPABASE_PROD_DB_URL to the Session pooler string)"
    echo "connection: OK"
    if has_bootstrap; then echo "rls_auto_enable + ensure_rls: present"; else echo "rls_auto_enable + ensure_rls: MISSING -> run: $0 bootstrap"; fi
    if [ "$("${PSQL[@]}" -c "select to_regclass('supabase_migrations.schema_migrations') is not null")" = "t" ]; then
      echo "applied migrations: $("${PSQL[@]}" -c "select count(*) from supabase_migrations.schema_migrations")"
    else
      echo "applied migrations: 0 (history table not created yet)"
    fi
    ;;
  bootstrap)
    if has_bootstrap; then echo "Target: PRODUCTION project $REF"; echo "already present, nothing to do"; exit 0; fi
    confirm "Create public.rls_auto_enable() and the ensure_rls event trigger?"
    "${PSQL[@]}" -f "$DIR/bootstrap-rls-auto-enable.sql"
    has_bootstrap && echo "bootstrap: OK" || die "bootstrap did not leave both objects in place"
    ;;
  dry-run)
    echo "Target: PRODUCTION project $REF"
    (cd "$ROOT" && supabase db push --db-url "$DB_URL" --dry-run)
    ;;
  push)
    has_bootstrap || die "rls_auto_enable / ensure_rls missing in prod. Run: $0 bootstrap"
    confirm "Apply the pending migrations?"
    (cd "$ROOT" && supabase db push --db-url "$DB_URL")
    ;;
  verify)
    echo "Target: PRODUCTION project $REF"
    actual="$(mktemp)"; trap 'rm -f "$actual"' EXIT
    "${PSQL[@]}" -f "$DIR/verify-prod.sql" > "$actual"
    local_migs="$(ls "$ROOT"/supabase/migrations/*.sql | sed -E 's#.*/([0-9]+)_.*#\1#' | sort | paste -sd, -)"
    awk -F'|' -v migs="$local_migs" '
      NR==FNR { k=$1; v=$0; sub(/^[^|]*\|/,"",v); want[k]=v; order[++n]=k; next }
      { k=$1; v=$0; sub(/^[^|]*\|/,"",v); got[k]=v }
      END {
        want["migrations"]=migs; order[++n]="migrations"
        bad=0
        for (i=1;i<=n;i++) {
          k=order[i]
          if (got[k]==want[k]) printf "PASS  %s\n", k
          else { printf "FAIL  %s\n      expected: %s\n      actual:   %s\n", k, want[k], got[k]; bad=1 }
        }
        exit bad
      }' "$DIR/verify-prod.expected" "$actual"
    ;;
esac
