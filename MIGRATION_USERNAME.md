# Username Authentication Migration

## What Changed

The authentication system has been updated from **email-based** to **username-based** login.

## Database Changes

### Schema Update
- Changed `User.email` field to `User.username`
- Updated unique constraint from email to username
- All authentication flows now use username instead of email

### Files Modified
1. `prisma/schema.prisma` - Updated User model
2. `prisma/seed.ts` - Updated to create user with username
3. `app/api/auth/login/route.ts` - Updated login API
4. `app/login/page.tsx` - Updated login form
5. `app/(dashboard)/layout.tsx` - Updated user display
6. `lib/auth/session.ts` - Updated session payload
7. `setup.sh` - Updated credentials in setup script
8. `setup.bat` - Updated credentials in setup script

## Manual Database Migration (if needed)

If you already have a database with the old schema, run this SQL:

```sql
-- Drop old unique constraint
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key";

-- Rename column
ALTER TABLE "User" RENAME COLUMN "email" TO "username";

-- Add new unique constraint
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
```

## New Default Credentials

- **Username**: `syahrul`
- **Password**: `syahrul2026`

## How to Apply Changes

### If starting fresh (no existing database):

1. Run setup script:
   ```bash
   ./setup.sh  # Mac/Linux
   # or
   setup.bat   # Windows
   ```

2. Or manually:
   ```bash
   npx dotenv -e .env.local -- npx prisma migrate dev --name username_auth
   npx prisma generate
   npx dotenv -e .env.local -- npx prisma db seed
   ```

### If you have existing data:

1. **Backup your database first!**
2. Run the SQL migration above
3. Run the seed script to create/update the default user
4. Update any existing users to have a username instead of email

## Testing

After applying changes:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000

3. Login with:
   - Username: `syahrul`
   - Password: `syahrul2026`

4. Verify the dashboard displays `@syahrul` as the user

## Rollback (if needed)

To revert back to email-based authentication:

```sql
-- Drop username constraint
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_username_key";

-- Rename column back to email
ALTER TABLE "User" RENAME COLUMN "username" TO "email";

-- Add email unique constraint
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
```

Then revert all the file changes mentioned in "Files Modified" section.