# 🚀 Backend Setup & Quick Start

## Prerequisites
- Node.js v14+
- MySQL Server
- npm or yarn

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
