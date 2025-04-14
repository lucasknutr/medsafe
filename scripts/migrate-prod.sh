#!/bin/bash

# Exit on error
set -e

echo "Starting database migration for production..."

# Hardcoded connection parameters for Supabase
DB_USER="postgres.yambexgrlxpirzbvpumq"
DB_PASS="Meds@fe2025"
DB_HOST="aws-0-sa-east-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"

echo "Using connection details:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Function to run a PostgreSQL command
run_psql() {
  local sql="$1"
  echo "Running SQL: $sql"
  
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$sql" -t
  local status=$?
  
  if [ $status -ne 0 ]; then
    echo "SQL command failed with status $status"
    return 1
  fi
  
  return 0
}

# Check database connection first
echo "Checking database connection..."
if ! run_psql "SELECT 1;"; then
  echo "Error: Could not connect to the database"
  exit 1
fi

# Check if the Slide table exists
echo "Checking if Slide table exists..."
TABLE_EXISTS=$(run_psql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Slide');")
TABLE_EXISTS=$(echo "$TABLE_EXISTS" | tr -d ' ')

if [ "$TABLE_EXISTS" = "t" ]; then
  echo "Slide table already exists, skipping creation"
else
  echo "Slide table does not exist, creating it..."
  if ! run_psql "CREATE TABLE IF NOT EXISTS \"public\".\"Slide\" (
    \"id\" SERIAL PRIMARY KEY,
    \"image\" TEXT NOT NULL,
    \"title\" TEXT NOT NULL,
    \"description\" TEXT NOT NULL,
    \"button_link\" TEXT NOT NULL,
    \"order\" INTEGER NOT NULL DEFAULT 0,
    \"created_at\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \"updated_at\" TIMESTAMP(3) NOT NULL
  );"; then
    echo "Error: Failed to create Slide table"
    exit 1
  fi
  echo "Slide table created successfully"
fi

echo "Migration completed successfully!" 