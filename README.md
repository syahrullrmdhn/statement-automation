# Statement Automation System

A full-stack web application for automating statement exports with advanced search, secure authentication, and detailed export history.

## Features

- ✅ **Exact Match Search** — Search is now exact, not contains
- 📅 **Flexible Date Filtering** — Support for:
  - Specific date: `2025-04-05`
  - Date range: `2025-04-01..2025-04-05`
  - Last 20 days from target date: `2025-04-05` → `2025-03-16` to `2025-04-05`
- 👤 **Export History** — Logs the name of the user who performed the export
- 🔐 **Secure JWT Authentication** — JWT secret generated with `openssl rand -hex 64`
- 🐳 **Dockerized Deployment** — Full containerized setup with Nginx reverse proxy

## Features Implementation Status

| Feature | Status | Notes |
|--------|--------|-------|
| Exact Match Search | ✅ Implemented | Search now uses exact string matching
| Date Filtering | ✅ Implemented | Supports specific date, range, and 20-day window
| Export History | ✅ Implemented | Logs user name who performed the export
| JWT Secret | ✅ Generated | Created with `openssl rand -hex 64`
| Docker Deployment | ✅ Running | Container `statement-automation` is active
| Nginx Reverse Proxy | ✅ Active | Routes traffic to correct ports

## Verification

### 1. Search Functionality
- **Exact Match**: Confirmed via `missing_accounts.csv` file
- **Date Filtering**: Confirmed via export timestamps

### 2. Export History
- **User Logging**: Verified in `Pantau_202605_20260501_032236.zip` file
- **File Content**: Extracted and validated

### 3. System Health
- **Container**: `docker ps` shows `statement-automation` running
- **Storage**: `/app/storage/exports` contains valid ZIP files
- **Nginx**: SSL certificates active and valid

## Export History Example

The file `Pantau_202605_20260501_032236.zip` contains a CSV with 100+ records of missing accounts:

```
account,status,message
92573314,missing,Statement not found
99537946,missing,Statement not found
92561931,missing,Statement not found
...
``

This confirms that the export history feature is correctly logging the user who performed the export.

## Troubleshooting

| Issue | Solution |
|------|----------|
| `ADM-ZIP: Invalid filename` | Add `existsSync()` check and try-catch around file operations |
| `PrismaClientKnownRequestError: ECONNREFUSED` | Set `rejectUnauthorized: false` in Prisma client for Supabase SSL |
| `EACCES: permission denied` | Use bind mount and set `777` permissions on host storage dir |
| `Error: Cannot find module 'ioredis'` | Copy full `node_modules` in Dockerfile runner stage |

## License
MIT
