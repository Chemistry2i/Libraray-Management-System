# 🎯 MODULAR LMS BACKEND - QUICK START VISUAL GUIDE

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   API CLIENT (Browser/Mobile)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   ROUTES LAYER                              │
│  ┌─────────┬──────────┬─────────────┬────────────┐          │
│  │  auth   │  books   │ borrowing   │   users    │          │
│  │ Routes  │ Routes   │   Routes    │  Routes    │          │
│  └────┬────┴────┬─────┴──────┬──────┴────────┬───┘          │
└───────┼────────────────────────────────────────┼─────────────┘
        │                                        │
        ▼                                        ▼
┌─────────────────┐                  ┌─────────────────────┐
│  MIDDLEWARE     │                  │  VALIDATORS         │
│  ───────────    │                  │  ──────────────     │
│  • Auth (JWT)   │                  │  • Input validation │
│  • Authorization│                  │  • Data sanitize    │
│  • Error Handle │                  │  • Format checking  │
└────────┬────────┘                  └──────────┬──────────┘
         │                                      │
         │                    ┌─────────────────┘
         │                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 CONTROLLERS LAYER                            │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐│
│  │     Auth     │     Book     │  Borrowing   │   User    ││
│  │ Controller   │ Controller   │ Controller   │Controller ││
│  └──────┬───────┴──────┬───────┴──────┬───────┴─────┬──────┘│
└─────────┼─────────────────────────────────────────────┼──────┘
          │                                            │
          ▼                                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  SERVICES LAYER (Business Logic)             │
│ ┌────────────┬────────────┬──────────────┬────────────────┐ │
│ │    Auth    │    Book    │  Borrowing   │     User       │ │
│ │  Service   │  Service   │   Service    │   Service      │ │
│ └─────┬──────┴─────┬──────┴──────┬───────┴─────┬─────────┘ │
└───────┼─────────────────────────────────────────┼───────────┘
        │                                         │
        ▼                                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   MODELS LAYER (Data Access)                 │
│  ┌──────────────┬──────────────┬────────────────────────┐  │
│  │  User Model  │  Book Model  │  Borrowing Model       │  │
│  │  - create()  │  - findAll() │  - checkout()          │  │
│  │  - findById()│  - search()  │  - returnBook()        │  │
│  │  - update()  │  - create()  │  - getHistory()        │  │
│  │  - getAll()  │  - delete()  │  - getActiveBooks()    │  │
│  └──────┬───────┴──────┬───────┴────────┬───────────────┘  │
└─────────┼──────────────────────────────────┼────────────────┘
          │                                  │
          │                    ┌─────────────┘
          │                    ▼
          │        ┌─────────────────────┐
          │        │   EXCEPTIONS        │
          │        │   ──────────────    │
          │        │  • ValidationError  │
          │        │  • AuthError        │
          │        │  • NotFoundError    │
          │        │  • DatabaseError    │
          │        └────────┬────────────┘
          │                 │
          └────────────────────────────────────────────────────┐
                           │                                   │
                           ▼                                   ▼
        ┌─────────────────────────────┐              ┌──────────────────┐
        │      UTILS LAYER            │              │   CONSTANTS      │
        │  ─────────────────────────  │              │   ───────────    │
        │  • hashPassword()           │              │  • ROLES         │
        │  • generateToken()          │              │  • BOOK_STATUS   │
        │  • verifyToken()            │              │  • FINE_PER_DAY  │
        │  • formatDate()             │              │  • Messages      │
        └─────────────────────────────┘              └──────────────────┘
                  │
                  │  ┌─────────────────────────────────┐
                  │  │   CONFIG LAYER                  │
                  └─→│  ──────────────────────────────  │
                     │  • Database config              │
                     │  • JWT settings                 │
                     │  • Environment variables        │
                     │  ├─ Connection Pool             │
                     │  └─ Credentials                 │
                     └────────────┬────────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────┐
                     │   MYSQL DATABASE    │
                     │  ──────────────────  │
                     │  • users table      │
                     │  • books table      │
                     │  • book_copies      │
                     │  • borrowing_rec    │
                     │  • reservations     │
                     └─────────────────────┘
```

---

## 🔄 Request-Response Cycle

### Example: User Login

```
1️⃣ CLIENT
   POST /api/auth/login
   {email: "user@test.com", password: "pass123"}
   
2️⃣ ROUTE HANDLER (authRoutes.js)
   Matches POST /api/auth/login
   Routes to AuthController.login()
   
3️⃣ VALIDATORS (validators.js)
   ✓ Email format valid?
   ✓ Password provided?
   
4️⃣ CONTROLLER (AuthController.js)
   Receives request
   Calls AuthService.login()
   
5️⃣ SERVICE (AuthService.js)
   Business logic:
   • Find user by email
   • Compare password
   • Generate JWT token
   Calls UserModel.findByEmail()
   
6️⃣ MODEL (UserModel.js)
   Database query:
   SELECT * FROM users WHERE email = ?
   
7️⃣ DATABASE (MySQL)
   Returns user record
   
8️⃣ MODEL
   Returns data to service
   
9️⃣ SERVICE
   Validates password with hashed version
   Generates JWT token using helpers
   
🔟 CONTROLLER
   Formats response using response.js
   
1️⃣1️⃣ MIDDLEWARE (errorHandler.js)
   No errors, pass through
   
1️⃣2️⃣ RESPONSE
   {
     success: true,
     message: "Login successful",
     data: {
       token: "eyJhbGciOiJIUzI1NiIs...",
       userId: 1
     }
   }
```

---

## 📁 File Organization

### ✅ Config Layer
```
config/
├── config.js      → Environment & constants
└── database.js    → MySQL connection pool
```

### ✅ Constants Layer
```
constants/
├── appConstants.js → Roles, statuses, limits
└── messages.js     → Success/error messages
```

### ✅ Exceptions Layer
```
exceptions/
└── AppError.js    → Custom error classes
```

### ✅ Models Layer
```
models/
├── UserModel.js       → User CRUD
├── BookModel.js       → Book CRUD
└── BorrowingModel.js  → Borrowing CRUD
```

### ✅ Services Layer
```
services/
├── AuthService.js      → Auth logic
├── BookService.js      → Book logic
├── BorrowingService.js → Borrowing logic
└── UserService.js      → User logic
```

### ✅ Controllers Layer
```
controllers/
├── AuthController.js      → Auth handlers
├── BookController.js      → Book handlers
├── BorrowingController.js → Borrowing handlers
└── UserController.js      → User handlers
```

### ✅ Routes Layer
```
routes/
├── authRoutes.js      → /api/auth/*
├── bookRoutes.js      → /api/books/*
├── borrowingRoutes.js → /api/borrowing/*
└── userRoutes.js      → /api/users/*
```

### ✅ Middleware Layer
```
middleware/
├── auth.js         → JWT & authorization
└── errorHandler.js → Global error handling
```

### ✅ Validators Layer
```
validators/
└── validators.js   → Input validation rules
```

### ✅ Utils Layer
```
utils/
├── helpers.js      → Helper functions
└── response.js     → Response formatting
```

---

## 🚀 Startup Sequence

```
1. npm run dev
   └─→ nodemon watches src/server.js

2. server.js starts
   ├─→ Import all middleware
   ├─→ Import all routes
   └─→ Setup error handler

3. Middleware initialized
   ├─→ Helmet (security headers)
   ├─→ CORS (cross-origin)
   ├─→ Compression (gzip)
   └─→ Morgan (logging)

4. Routes registered
   ├─→ /api/auth routes
   ├─→ /api/books routes
   ├─→ /api/borrowing routes
   └─→ /api/users routes

5. Database connection attempt
   └─→ Test MySQL connection

6. Server listening
   └─→ Ready on http://localhost:5000
```

---

## 🔌 API Endpoint Examples

```
┌─ AUTHENTICATION
├─ POST   /api/auth/register          [Public]
├─ POST   /api/auth/login             [Public]
└─ GET    /api/auth/me                [Protected]

┌─ BOOKS
├─ GET    /api/books                  [Public]
├─ GET    /api/books/search?q=query   [Public]
├─ GET    /api/books/:id              [Public]
├─ POST   /api/books                  [Librarian+]
├─ PUT    /api/books/:id              [Librarian+]
└─ DELETE /api/books/:id              [Admin]

┌─ BORROWING
├─ POST   /api/borrowing/checkout     [Protected]
├─ POST   /api/borrowing/return       [Protected]
├─ GET    /api/borrowing/my-books     [Protected]
└─ GET    /api/borrowing/history      [Protected]

┌─ USERS
├─ GET    /api/users/profile          [Protected]
├─ PUT    /api/users/profile          [Protected]
├─ GET    /api/users                  [Admin]
└─ GET    /api/users/:id              [Protected]
```

---

## 🔒 How Security Works

### 1. Password Hashing
```
User enters password
    ↓
bcryptjs.hash(password, 10 rounds)
    ↓
Salt + Hash stored in database
    ↓
Original password never stored
```

### 2. JWT Authentication
```
Login successful
    ↓
Generate JWT token
    ↓
Token contains: userId, email, role
    ↓
Client stores token (localStorage)
    ↓
Each request: Authorization: Bearer <token>
    ↓
Server verifies token
    ↓
Access granted with user info
```

### 3. Authorization
```
Request received with token
    ↓
Extract user role from token
    ↓
Check route requirements
    ↓
Is role allowed? 
├─ YES → Continue
└─ NO → 403 Forbidden
```

---

## 📈 Performance Features

```
✅ Connection Pooling
   Maximum 10 simultaneous connections

✅ Request Compression
   Gzip compression for responses

✅ Request Logging
   Morgan logs all requests

✅ Error Handling
   Fast error responses

✅ Validation
   Prevent invalid data early

✅ Pagination
   Limit data per request
```

---

## 🔗 How Layers Connect

```
Layer Connection Example: Creating a Book

CLIENT
  │
  └─→ POST /api/books {title, author, ...}
       │
       └─→ ROUTE (bookRoutes.js)
            ├─ Check: POST on /api/books ✓
            └─ Call: BookController.createBook()
                │
                └─→ MIDDLEWARE (auth.js)
                     ├─ Verify JWT token ✓
                     ├─ Check role [Librarian+] ✓
                     └─ Continue
                      │
                      └─→ VALIDATOR (validators.js)
                           ├─ Validate: title ✓
                           ├─ Validate: author ✓
                           └─ Call: controller method
                            │
                            └─→ CONTROLLER (BookController.js)
                                 ├─ Extract data
                                 ├─ Call service
                                 └─ Format response
                                  │
                                  └─→ SERVICE (BookService.js)
                                       ├─ Business logic
                                       ├─ Call model
                                       └─ Return result
                                        │
                                        └─→ MODEL (BookModel.js)
                                             ├─ Build query
                                             ├─ Connect to DB
                                             ├─ Execute INSERT
                                             └─ Return insertId
                                              │
                                              └─→ DATABASE
                                                   └─ INSERT INTO books...

RESPONSE
  {"success": true, "message": "Book added", "data": {bookId: 1}}
```

---

## 🎯 Key Principles

```
✅ MODULARITY    Each layer is independent
✅ REUSABILITY   Code used in multiple places
✅ TESTABILITY   Each module can be tested
✅ MAINTAINABILITY Easy to find and modify
✅ SCALABILITY   Easy to add features
✅ SECURITY      Multiple protection layers
✅ PERFORMANCE   Optimized queries
✅ CLARITY       Clear code organization
```

---

## 🚀 Ready to Use!

### Quick Start
```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create database
mysql -u root -p -e "CREATE DATABASE lms_db;"

# 4. Import schema
mysql -u root -p lms_db < database/schema.sql

# 5. Start server
npm run dev
```

**Your API is now running at:** http://localhost:5000

---

**This is a fully modular, production-ready backend system!** 🎉
