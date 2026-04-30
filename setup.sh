#!/bin/bash

echo "🚀 Statement Automation System Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ ERROR: .env.local file not found!"
  echo "Please create .env.local with your database and S3 credentials."
  exit 1
fi

echo "✅ .env.local found"
echo ""

# Run Prisma migration
echo "📊 Running Prisma migrations..."
npx dotenv -e .env.local -- npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Migration failed!"
  exit 1
fi
echo "✅ Migration completed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Prisma client generation failed!"
  exit 1
fi
echo "✅ Prisma client generated"
echo ""

# Seed database
echo "🌱 Seeding database with default admin user..."
npx dotenv -e .env.local -- npx prisma db seed
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Database seeding failed!"
  exit 1
fi
echo "✅ Database seeded"
echo ""

# Create storage directory
echo "📁 Creating storage directories..."
mkdir -p storage/s3-cache
mkdir -p storage/exports
echo "✅ Storage directories created"
echo ""

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Open browser at: http://localhost:3000"
echo "  3. Login with:"
echo "     Username: syahrul"
echo "     Password: syahrul2026"
echo ""