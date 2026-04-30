# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Access to PostgreSQL database (credentials provided)
- Access to AWS S3 bucket (credentials provided)
- Git (optional)

## Setup Instructions

### Option 1: Automated Setup (Recommended)

#### Unix/Mac/Linux
```bash
cd statement-automation
./setup.sh
```

#### Windows
```cmd
cd statement-automation
setup.bat
```

This will:
1. Verify environment configuration
2. Run database migrations
3. Generate Prisma client
4. Seed default admin user
5. Create required directories

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Verify Environment
Ensure `.env.local` exists with all required variables:
- DATABASE_URL
- JWT_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- S3_BUCKET
- and other variables as specified

#### 3. Database Setup
```bash
# Run migrations
npx dotenv -e .env.local -- npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed database with default user
npx dotenv -e .env.local -- npx prisma db seed
```

#### 4. Create Storage Directories
```bash
mkdir -p storage/s3-cache
mkdir -p storage/exports
```

#### 5. Start Development Server
```bash
npm run dev
```

## Using the Application

### 1. First Login
- Navigate to: http://localhost:3000
- You'll be redirected to login page
- Use default credentials:
  - **Username**: `syahrul`
  - **Password**: `syahrul2026`

### 2. Dashboard Overview
The dashboard shows:
- Total statement files synced
- Total sync jobs run
- Total export jobs created
- Completed export jobs
- Quick actions for sync and export

### 3. Sync Statements
1. Navigate to **Statement Sync**
2. Select:
   - Year (e.g., 2025)
   - Month (e.g., 04)
   - Server (ALL or specific server)
3. Optionally check **Force Resync** to redownload files
4. Click **Start Sync**
5. View sync results immediately

### 4. Export Statements
1. Navigate to **Export Statement**
2. Enter:
   - Export title (e.g., "Pantau")
   - Period (year and month)
   - Server filter (optional)
   - List of accounts (one per line or comma-separated)
3. Click **Export**
4. Download the generated ZIP file

### 5. View Export History
1. Navigate to **Export History**
2. See all previous export jobs
3. Download completed exports
4. View status of running/partial/failed jobs

### 6. Settings
View current configuration:
- Application information
- Database connection details
- S3 configuration

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run database migrations
npx dotenv -e .env.local -- npx prisma migrate dev

# Reset database (⚠️ DELETES ALL DATA)
npx dotenv -e .env.local -- npx prisma migrate reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Seed database again
npx dotenv -e .env.local -- npx prisma db seed
```

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in .env.local
- Check database server is running
- Ensure network connectivity

### S3 Connection Issues
- Verify AWS credentials in .env.local
- Check bucket name and region
- Ensure IAM permissions are correct

### Build/Development Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Authentication Issues
```bash
# Clear browser cookies and localStorage
# Or use incognito mode

# Re-seed database with fresh user
npx dotenv -e .env.local -- npx prisma db seed
```

## Development Tips

1. **Testing S3 Connection**: Visit `/api/s3/test` to verify S3 connectivity
2. **Database Inspection**: Use Prisma Studio: `npx prisma studio`
3. **View Logs**: Check console for detailed error messages
4. **Session Persistence**: Sessions persist for 7 days by default
5. **Local Storage**: Files are stored in `./storage/` directory

## Security Notes

- Never commit `.env.local` to Git
- Change default admin password after first login
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement proper backup strategies

## Production Deployment

1. Update `JWT_SECRET` to a secure random value
2. Set `NODE_ENV=production`
3. Ensure DATABASE_URL points to production database
4. Use production AWS credentials with proper IAM roles
5. Enable `secure` flag on cookies (requires HTTPS)
6. Set up proper backup and monitoring

## Support

For issues or questions:
1. Check the detailed README in the project root
2. Review the PROJECT_OVERVIEW.md for architecture details
3. Consult Next.js documentation: https://nextjs.org/docs
4. Consult Prisma documentation: https://www.prisma.io/docs