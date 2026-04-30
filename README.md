# Statement Automation System

Aplikasi web internal untuk membantu proses sinkronisasi dan ekspor file statement dari Amazon S3.

## Setup Instruction

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Environment variables sudah dikonfigurasi di file `.env.local`:
- Database: Supabase PostgreSQL (pooler)
- AWS S3: Bucket `petisejuk`
- AWS Region: `ap-southeast-3`
- S3 prefix utama: `STATEMENT/`

### 3. Setup Database

Jalankan migration Prisma:

```bash
npx dotenv -e .env.local -- npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed default admin user:

```bash
npx tsx prisma/seed.ts
```

### 4. Start Development Server

```bash
npm run dev
```

Buka browser di `http://localhost:3000`

Jika muncul pesan "Another next dev server is already running", stop dulu proses lama:

```bash
pkill -f "next dev"
```

### 5. Login

Gunakan kredensial default:
- **Username**: `syahrul`
- **Password**: `syahrul2026`

## Features

- **Dashboard**: Overview sistem dengan statistik
- **Statement Sync**: Sinkronisasi file dari S3 ke local storage
- **Export Statement**: Generate ZIP berdasarkan periode dan daftar account
- **Auto Extract Account**: Bisa paste isi email dealer lalu account number diekstrak otomatis
- **User Management**: Kelola user, role, status aktif, dan reset password
- **Export History**: Riwayat proses export
- **Settings**: Informasi konfigurasi sistem

## Automation

### 1. Auto sync jam 07:00 Asia/Jakarta

Disediakan endpoint cron:

`POST /api/cron/sync-daily`

Header wajib:

- `x-cron-secret: <CRON_SECRET>`

Env yang perlu ditambahkan di `.env.local`:

```env
CRON_SECRET="ganti_dengan_secret_aman"
```

Contoh setup external cron (server/cPanel/cron-job.org):

- Schedule: `0 7 * * *` (Asia/Jakarta)
- Method: `POST`
- URL: `https://your-domain.com/api/cron/sync-daily`
- Header: `x-cron-secret: <CRON_SECRET>`

## Stack Teknologi

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- AWS SDK v3 (S3)
- JWT Authentication

## Catatan

- Credentials database dan S3 sudah disertakan dalam `.env.local`
- File `.env.local` sudah diignore dari Git
- Local storage akan dibuat otomatis di folder `./storage/`
- URL dashboard yang benar adalah `/dashboard` (bukan `/(dashboard)`)
- Jika hasil sync `empty`, cek parameter year/month/server dan prefix S3
