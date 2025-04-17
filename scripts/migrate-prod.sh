#!/bin/bash

# Exit on error
set -e

echo "Starting database migration for production..."

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo "Using connection details:"
echo "Host: $(echo $DATABASE_URL | grep -o '@[^:]*' | sed 's/@//')"
echo "Port: $(echo $DATABASE_URL | grep -o ':[0-9]*' | sed 's/://')"
echo "Database: $(echo $DATABASE_URL | grep -o '/[^?]*' | sed 's/\///')"
echo "User: $(echo $DATABASE_URL | grep -o '://[^:]*' | sed 's/:\/\///')"

# Test database connection
echo "Checking database connection..."
psql "$DATABASE_URL" -c "SELECT 1;" || {
  echo "Error: Failed to connect to database"
  exit 1
}

# Create InsurancePlan table if it doesn't exist
echo "Checking if InsurancePlan table exists..."
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS \"InsurancePlan\" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  features TEXT[] NOT NULL,
  \"isActive\" BOOLEAN NOT NULL DEFAULT true,
  \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP(3) NOT NULL
);" || {
  echo "Error: Failed to create InsurancePlan table"
  exit 1
}

echo "InsurancePlan table created successfully"

# Create insurance_plans table if it doesn't exist
echo "Checking if insurance_plans table exists..."
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS insurance_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  features TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL
);" || {
  echo "Error: Failed to create insurance_plans table"
  exit 1
}

echo "insurance_plans table created successfully"

# Create Slide table if it doesn't exist
echo "Checking if Slide table exists..."
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS \"Slide\" (
  id SERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button_link TEXT NOT NULL,
  \"order\" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL
);" || {
  echo "Error: Failed to create Slide table"
  exit 1
}

echo "Slide table created successfully"

echo "Database migration completed successfully" 