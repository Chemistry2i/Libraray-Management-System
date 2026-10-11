# 🚀 Backend Setup & Quick Start

## Prerequisites
- Node.js v14+
- MySQL Server
- npm or yarn

## Railway database setup (new database)

For a new Railway MySQL database, use the consolidated schema instead of importing `database/schema.sql` and then running every migration separately. The bundle includes the current table definitions, runtime `book_views` table, digital collections, Cloudinary metadata, and borrowing statistics views.

Run from the repository root after selecting the Railway database connection values:

```bash
mysql -h YOUR_HOST -P YOUR_PORT -u YOUR_USERNAME -p YOUR_DATABASE < backend/tables/railway_schema.sql
```

This is for an **empty database only**. Do not run it as an upgrade over an existing installation. For an existing database, back it up and apply only the relevant incremental migrations in `backend/database/`.

See [`tables/README.md`](tables/README.md) for details.

## Render and Railway environment

The backend is hosted at `https://kamulicu.onrender.com`. In the frontend's Vercel project settings, set `VITE_API_BASE_URL=https://kamulicu.onrender.com/api`, then redeploy the frontend. The backend allows `https://kamuli-cu.vercel.app` by default; set `CORS_ORIGINS` in Render to a comma-separated list if you use additional frontend domains.

For the Render backend service, use `backend` as the Root Directory, `npm install` as the Build Command, and `npm start` as the Start Command. For MySQL hosted on Railway, set `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE` using Railway's public TCP proxy connection values; the private Railway hostname is not reachable from Render. Also set `JWT_SECRET` to a long random value and `NODE_ENV=production`. The backend accepts `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` as overrides, so remove stale `DB_*` values if configuring `MYSQL*`. Optional Cloudinary and email variables are listed in `.env.example`.

## Installation

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create Database
```bash
mysql -u root -p -e "CREATE DATABASE lms_db;"
```

### Step 3: Import Schema
```bash
mysql -u root -p lms_db < database/schema.sql
```

### Step 3.1: Add Digital Collections
For an existing LMS database, apply the digital collections migration:
```bash
mysql -u root -p lms_db < database/schema_update_digital_collections.sql
```
This creates the collection and digital object tables. Digital objects are served through access-controlled API routes, not the public static uploads directory.

For an installation that already has the original digital collections tables, apply the analytics and rights-audit migration once:
```bash
mysql -u root -p lms_db < database/schema_update_digital_collection_enhancements.sql
```
This adds reviewer/evidence/expiry fields, rights history, and view/download event tables. Do not rerun this migration after it succeeds because its `ALTER TABLE` adds columns and a constraint.

Apply the storage metadata migration once after the previous digital collection migrations:
```bash
mysql -u root -p lms_db < database/schema_update_digital_collection_cloudinary.sql
```

For existing digital collection installations, apply the Cloudinary storage metadata migration once:
```bash
mysql -u root -p lms_db < database/schema_update_digital_collection_cloudinary.sql
```

### Step 4: Configure .env
```bash
cp .env.example .env
# Set MySQL/JWT values and CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
```
Digital collection files use Cloudinary authenticated assets when all three Cloudinary values are configured. API secrets stay on the backend; files stream through the rights-checked LMS routes. Without Cloudinary credentials, development falls back to private local storage.

For an existing LMS database, add the book-cover Cloudinary asset-ID column once:
```bash
mysql -u root -p lms_db < database/schema_update_book_cover_cloudinary.sql
```
New and replacement JPEG, PNG, or WebP book covers use the configured Cloudinary account; legacy covers and unconfigured development setups continue using their existing local URLs.

### Step 5: Start Server
```bash
npm run dev
```

Server runs at: **http://localhost:5000**

## Testing Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Books
```bash
curl http://localhost:5000/api/books
```

### Search Books
```bash
curl "http://localhost:5000/api/books/search?q=harry"
```

---

For more details, see `MODULAR_ARCHITECTURE.md`
