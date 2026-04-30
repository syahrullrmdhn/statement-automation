# Statement Automation System

Aplikasi web internal untuk membantu proses sinkronisasi dan ekspor file statement dari Amazon S3.

## Setup Instruction

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Environment variables sudah dikonfigurasi di file `.env.local`:
- Database: PostgreSQL di 195.88.211.210
- AWS S3: Bucket `petisejuk` dengan prefix statement

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
npx dotenv -e .env.local -- npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Buka browser di `http://localhost:3000`

### 5. Login

Gunakan kredensial default:
- **Username**: `syahrul`
- **Password**: `syahrul2026`

## Features

- **Dashboard**: Overview sistem dengan statistik
- **Statement Sync**: Sinkronisasi file dari S3 ke local storage
- **Export Statement**: Generate ZIP berdasarkan periode dan daftar account
- **Export History**: Riwayat proses export
- **Settings**: Informasi konfigurasi sistem

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