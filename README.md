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

## Deployment

### 1. Prerequisites
- Node.js 22+
- Docker & Docker Compose
- Nginx with Let's Encrypt SSL
- `openssl` for JWT secret generation

### 2. Setup
```bash
# Generate JWT secret
openssl rand -hex 64

# Copy the secret to .env.local
# Example:
# JWT_SECRET=your-generated-secret-here

# Build and start
npm run build
npm run start
```

### 3. Nginx Configuration
Ensure your Nginx config includes:
```nginx
server {
    server_name statement.mastolongin.web.id;
    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate ...;
    ssl_certificate_key ...;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

### 4. Docker Compose
```yaml
services:
  statement-automation:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: statement-automation
    restart: unless-stopped
    ports:
      - "3001:3000"
    env_file:
      - .env.local
    volumes:
      - /home/ubuntu/statement-automation/storage:/app/storage
```

## Troubleshooting

| Issue | Solution |
|------|----------|
| `ADM-ZIP: Invalid filename` | Add `existsSync()` check and try-catch around file operations |
| `PrismaClientKnownRequestError: ECONNREFUSED` | Set `rejectUnauthorized: false` in Prisma client for Supabase SSL |
| `EACCES: permission denied` | Use bind mount and set `777` permissions on host storage dir |
| `Error: Cannot find module 'ioredis'` | Copy full `node_modules` in Dockerfile runner stage |

## License
MIT
