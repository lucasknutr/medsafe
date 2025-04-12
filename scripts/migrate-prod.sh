#!/bin/bash

# Pull environment variables from Vercel
echo "Pulling environment variables from Vercel..."
vercel env pull .env.production

# Run Prisma migration
echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Migration completed!" 