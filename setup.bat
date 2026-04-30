@echo off
echo 🚀 Statement Automation System Setup
echo ====================================
echo.

REM Check if .env.local exists
if not exist .env.local (
  echo ❌ ERROR: .env.local file not found!
  echo Please create .env.local with your database and S3 credentials.
  exit /b 1
)

echo ✅ .env.local found
echo.

REM Run Prisma migration
echo 📊 Running Prisma migrations...
call npx dotenv -e .env.local -- npx prisma migrate dev --name init
if errorlevel 1 (
  echo ❌ ERROR: Migration failed!
  exit /b 1
)
echo ✅ Migration completed
echo.

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
  echo ❌ ERROR: Prisma client generation failed!
  exit /b 1
)
echo ✅ Prisma client generated
echo.

REM Seed database
echo 🌱 Seeding database with default admin user...
call npx dotenv -e .env.local -- npx prisma db seed
if errorlevel 1 (
  echo ❌ ERROR: Database seeding failed!
  exit /b 1
)
echo ✅ Database seeded
echo.

REM Create storage directory
echo 📁 Creating storage directories...
if not exist storage\s3-cache mkdir storage\s3-cache
if not exist storage\exports mkdir storage\exports
echo ✅ Storage directories created
echo.

echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Open browser at: http://localhost:3000
echo   3. Login with:
echo      Username: syahrul
echo      Password: syahrul2026
echo.

pause