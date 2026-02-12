#!/bin/bash

# Fix PostgreSQL permissions for unipilot database
# PostgreSQL 15+ restricted public schema permissions.

DB_NAME="unipilot"
DB_USER="postgres"

echo "Attempting to fix permissions for database: $DB_NAME"

# Try to find psql
PSQL_PATH=$(which psql)

if [ -z "$PSQL_PATH" ]; then
    # Fallback paths
    if [ -f "/opt/homebrew/bin/psql" ]; then
        PSQL_PATH="/opt/homebrew/bin/psql"
    elif [ -f "/usr/local/bin/psql" ]; then
        PSQL_PATH="/usr/local/bin/psql"
    else
        echo "Error: psql not found in PATH or standard locations."
        exit 1
    fi
fi

echo "Using psql at: $PSQL_PATH"

# Grant permissions. We use -U postgres because it's usually the superuser.
# If password is required, it will prompt.
$PSQL_PATH -U $DB_USER -d $DB_NAME -c "ALTER SCHEMA public OWNER TO $DB_USER;"
$PSQL_PATH -U $DB_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
$PSQL_PATH -U $DB_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO public;"

echo "✅ Permissions fix attempted!"
echo "Now try: npm run migrate"
