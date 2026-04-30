# Statement Automation System - Project Overview

## Project Structure

```
statement-automation/
├── app/
│   ├── (dashboard)/              # Protected routes with dashboard layout
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard homepage
│   │   ├── settings/
│   │   │   └── page.tsx         # Settings page
│   │   └── statement/
│   │       ├── sync/
│   │       │   └── page.tsx     # Statement sync page
│   │       ├── export/
│   │       │   └── page.tsx     # Export statements page
│   │       └── history/
│   │           └── page.tsx     # Export history page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts     # Login API
│   │   │   ├── logout/
│   │   │   │   └── route.ts     # Logout API
│   │   │   └── me/
│   │   │       └── route.ts     # Current user API
│   │   ├── s3/
│   │   │   └── test/
│   │   │       └── route.ts     # S3 connection test API
│   │   └── statement/
│   │       ├── sync/
│   │       │   └── route.ts     # Sync statements API
│   │       └── export/
│   │           ├── route.ts     # Export statements API
│   │           └── [id]/
│   │               └── download/
│   │                   └── route.ts  # Download export API
│   ├── layout.tsx               # Root layout with Albert Sans font
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── page.tsx                 # Root redirect page
│   └── globals.css              # Tailwind CSS setup
├── components/
│   └── logout-button.tsx        # Logout button component
├── lib/
│   ├── auth/
│   │   └── session.ts           # Session management helpers
│   ├── db.ts                    # Prisma client setup
│   ├── s3/
│   │   ├── client.ts            # AWS S3 client
│   │   └── download.ts          # S3 file download utility
│   └── statement/
│       ├── patterns.ts          # Pattern matching helpers
│       ├── sync-service.ts      # Sync business logic
│       └── export-service.ts    # Export business logic
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Database seeding
│   └── migrations/              # Database migrations
├── middleware.ts                # Authentication middleware
├── packages.json                # Dependencies
├── .env.local                   # Environment variables
├── setup.sh                     # Setup script (Unix)
└── setup.bat                    # Setup script (Windows)
```

## Key Features Implementation

### 1. Authentication System
- JWT-based authentication with httpOnly cookies
- Session persists across page refreshes
- Protected routes via middleware
- Default admin user seeding

### 2. Dashboard & UI
- Clean, elegant sidebar navigation
- Albert Sans font for modern typography
- Tailwind CSS with custom themes
- Responsive design

### 3. Statement Sync
- Connects to Amazon S3
- Filters by period (year/month) and server
- Downloads ZIP files to local storage
- Updates database metadata
- Shows sync progress and results

### 4. Export System
- Accepts list of accounts
- Searches for `<account>_mail.htm` files
- Generates renamed ZIP output
- Tracks export history
- Provides download links

### 5. Database Models
- Users (with roles: ADMIN, OPERATOR, VIEWER)
- StatementFile (S3 metadata and local paths)
- SyncJob (sync history and status)
- ExportJob (export metadata)
- ExportJobAccount (per-account export details)

## Technology Stack

- **Frontend**: Next.js 16 App Router, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Storage**: AWS S3 with AWS SDK v3
- **Authentication**: JWT with jose library
- **ZIP Operations**: adm-zip

## Security Considerations

- Credentials stored in `.env.local` (not committed)
- httpOnly cookies prevent XSS attacks
- Password hashing with bcrypt
- JWT-based session management
- Protected API routes

## Environment Variables

Required in `.env.local`:
- DATABASE_URL (PostgreSQL connection string)
- JWT_SECRET (32+ characters for session security)
- AWS_* (S3 credentials and configuration)
- APP_STORAGE_PATH (local storage directory)

## Setup Instructions

1. Clone project and navigate to directory
2. Run setup script (Unix/Mac: `./setup.sh`, Windows: `setup.bat`)
3. Development server: `npm run dev`
4. Login with: admin@statement.local / Admin12345

## Development Notes

- The middleware will redirect unauthenticated users to login
- Protected routes require valid JWT session
- Storage directories are created automatically
- Database migrations are version-controlled
- API routes validate user authentication