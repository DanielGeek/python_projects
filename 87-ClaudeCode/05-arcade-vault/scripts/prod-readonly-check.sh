#!/usr/bin/env bash
# Checks the read-only production role (claude_readonly) through the Supavisor pooler.
# Only runs SELECTs. Never prints the password.
#
# Usage (from 05-arcade-vault/):
#   bash scripts/prod-readonly-check.sh [path/to/env-file]
#
# The env file must define SUPABASE_PROD_DB_URL_READ_ONLY. Default lookup order:
#   the path argument, ../.env.prod.claude, ./.env.prod.claude
#
# The URL is split by hand (last '@' separates user info from host), so a password with
# raw '@' or '#' works. A percent-encoded password (%40, %23, ...) is decoded too.

set -u

KEY="SUPABASE_PROD_DB_URL_READ_ONLY"
ENV_FILE="${1:-}"
cd "$(dirname "$0")/.." || exit 1
case "$ENV_FILE" in ""|/*) ;; *) ENV_FILE="$OLDPWD/$ENV_FILE" ;; esac

if [ -z "$ENV_FILE" ]; then
  for f in ../.env.prod.claude ./.env.prod.claude; do
    [ -f "$f" ] && ENV_FILE="$f" && break
  done
fi
[ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ] || { echo "env file not found (pass it as first argument)"; exit 1; }
command -v psql >/dev/null || { echo "psql not found (brew install libpq)"; exit 1; }

url="$(grep -E "^${KEY}=" "$ENV_FILE" | tail -1 | cut -d= -f2-)"
[ -n "$url" ] || { echo "$KEY not found in $ENV_FILE"; exit 1; }

rest="${url#*://}"
userinfo="${rest%@*}"        # up to the LAST '@'
hostpart="${rest##*@}"
user="${userinfo%%:*}"
password="${userinfo#*:}"
hostport="${hostpart%%/*}"
host="${hostport%:*}"
port="${hostport##*:}"
db="${hostpart#*/}"; db="${db%%\?*}"

if [[ "$password" == *%[0-9A-Fa-f][0-9A-Fa-f]* ]]; then
  password="$(printf '%b' "${password//%/\\x}")"
fi

export PGHOST="$host" PGPORT="$port" PGUSER="$user" PGPASSWORD="$password" PGDATABASE="$db"
export PGSSLMODE=require PGCONNECT_TIMEOUT=10

echo "env file : $ENV_FILE"
echo "target   : $user @ $host:$port/$db (password hidden)"
echo

pass=0; fail=0
ok()  { echo "  PASS  $1"; pass=$((pass + 1)); }
bad() { echo "  FAIL  $1"; fail=$((fail + 1)); }

q() { psql -X -At -v ON_ERROR_STOP=1 -c "$1" 2>&1; }

# 1. Connection
out="$(q "select current_user")"
if [ $? -ne 0 ]; then
  echo "  FAIL  connection"
  echo "$out" | sed 's/^/        /'
  echo
  echo "timeout        -> network/firewall blocks port $port (try another network)"
  echo "password auth  -> wrong password, or Supavisor still caches the old one: wait a minute and retry"
  echo "tenant/user    -> the user must be <role>.<project-ref>"
  exit 1
fi
ok "connected as $out"

# 2. Session is read-only
out="$(q "select current_setting('default_transaction_read_only')")"
[ "$out" = "on" ] && ok "default_transaction_read_only = on" || bad "default_transaction_read_only = '$out' (expected on)"

# 3. Role flags
out="$(q "select rolbypassrls || '/' || rolcanlogin || '/' || rolconnlimit from pg_roles where rolname = 'claude_readonly'")"
[ "$out" = "true/true/3" ] && ok "role flags bypassrls/login/connlimit = $out" || bad "role flags = '$out' (expected true/true/3)"

# 4. Reads real rows through RLS bypass
out="$(q "select count(*) from public.games")"
[[ "$out" =~ ^[0-9]+$ ]] && [ "$out" -gt 0 ] && ok "public.games rows = $out" || bad "public.games: '$out' (expected > 0)"
for t in scores profiles; do
  out="$(q "select count(*) from public.$t")"
  [[ "$out" =~ ^[0-9]+$ ]] && ok "public.$t rows = $out" || bad "public.$t: '$out'"
done

# 5. Migration history
out="$(q "select count(*) || ' (latest ' || coalesce(max(version), '-') || ')' from supabase_migrations.schema_migrations")"
[[ "$out" =~ ^[0-9]+\  ]] && ok "migrations in prod = $out" || bad "schema_migrations: '$out'"
echo "        local files: $(ls supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ') (latest $(ls supabase/migrations/*.sql 2>/dev/null | tail -1 | xargs -n1 basename 2>/dev/null | cut -d_ -f1))"

# 6. No write privileges anywhere
out="$(q "select count(*) from information_schema.role_table_grants where grantee = 'claude_readonly' and privilege_type <> 'SELECT'")"
[ "$out" = "0" ] && ok "write grants = 0" || bad "write grants = '$out' (expected 0)"
out="$(q "select has_table_privilege('claude_readonly','public.scores','insert') or has_table_privilege('claude_readonly','public.games','update') or has_table_privilege('claude_readonly','public.profiles','delete')")"
[ "$out" = "f" ] && ok "no insert/update/delete on public tables" || bad "write privilege check = '$out' (expected f)"

# 7. Sensitive schemas stay closed
out="$(q "select count(*) from auth.users")"
[[ "$out" == *"permission denied"* ]] && ok "auth.users denied" || bad "auth.users readable or unexpected: '$out'"

echo
echo "result: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
