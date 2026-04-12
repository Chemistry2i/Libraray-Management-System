# 🎯 LMS Backend - Modular Architecture Complete

## ✅ Project Structure

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── config.js          # Environment config
│   │   └── database.js        # MySQL connection pool
│   │
│   ├── constants/             # App constants & messages
│   │   ├── appConstants.js    # Roles, statuses, constants
│   │   └── messages.js        # Success & error messages
│   │
│   ├── exceptions/            # Custom exceptions
│   │   └── AppError.js        # Error classes
│   │
│   ├── models/                # Data Access Layer
│   │   ├── UserModel.js       # User database operations
│   │   ├── BookModel.js       # Book database operations
│   │   └── BorrowingModel.js  # Borrowing database operations
│   │
│   ├── services/              # Business Logic Layer
│   │   ├── AuthService.js     # Authentication logic
│   │   ├── BookService.js     # Book operations logic
│   │   ├── BorrowingService.js# Borrowing logic
│   │   └── UserService.js     # User operations logic
│   │
│   ├── controllers/           # Request Handlers
│   │   ├── AuthController.js  # Auth endpoints handler
│   │   ├── BookController.js  # Book endpoints handler
│   │   ├── BorrowingController.js # Borrowing handler
│   │   └── UserController.js  # User endpoints handler
│   │
│   ├── routes/                # API Routes
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── bookRoutes.js      # Book endpoints
│   │   ├── borrowingRoutes.js # Borrowing endpoints
│   │   └── userRoutes.js      # User endpoints
│   │
│   ├── middleware/            # Custom Middleware
│   │   ├── auth.js            # JWT auth & authorization
│   │   └── errorHandler.js    # Global error handler
│   │
│   ├── validators/            # Request Validation
│   │   └── validators.js      # Express-validator rules
│   │
│   ├── utils/                 # Utility Functions
│   │   ├── helpers.js         # Password, JWT, date helpers
│   │   └── response.js        # Response formatting
│   │
│   └── server.js              # Main Express app
│
├── database/
│   └── schema.sql            # Database schema
│
├── .env                      # Environment variables
├── package.json              # Dependencies
└── README.md                # Documentation
```

## 📋 Modular Architecture Layers

### 1️⃣ **Config Layer** (`config/`)
- Centralized configuration management
- Database connection pooling
- Environment variable handling

### 2️⃣ **Constants Layer** (`constants/`)
- App-wide constants (roles, statuses)
- Standardized messages (error, success)
- Ensures consistency across app

### 3️⃣ **Exception Layer** (`exceptions/`)
- Custom error classes
- Standardized error handling
- Easy error tracking

### 4️⃣ **Models Layer** (`models/`)
- Database access patterns
- Query building
- Data persistence operations
- **Classes**: UserModel, BookModel, BorrowingModel

### 5️⃣ **Services Layer** (`services/`)
- Business logic implementation
- Data validation
- Cross-model operations
- **Classes**: AuthService, BookService, BorrowingService, UserService

### 6️⃣ **Controllers Layer** (`controllers/`)
- HTTP request handling
- Request/response mapping
- Error delegation to middleware
- **Classes**: AuthController, BookController, BorrowingController, UserController

### 7️⃣ **Routes Layer** (`routes/`)
- API endpoint definitions
- Middleware assignment
- Route-level validation
- **Files**: authRoutes, bookRoutes, borrowingRoutes, userRoutes

### 8️⃣ **Middleware Layer** (`middleware/`)
- Authentication (JWT verification)
- Authorization (role checking)
- Global error handling
- Request logging (Morgan)

### 9️⃣ **Validators Layer** (`validators/`)
- Request validation rules
- Express-validator integration
- Input sanitization

### 🔟 **Utils Layer** (`utils/`)
- Helper functions (password hashing, JWT, date formatting)
- Response formatting utilities
- Reusable logic

## 🔄 Data Flow

```
REQUEST
   ↓
ROUTE (authRoutes.js)
   ↓
MIDDLEWARE (auth.js - JWT verification)
   ↓
VALIDATOR (validators.js - input validation)
   ↓
CONTROLLER (AuthController.js - request handling)
   ↓
SERVICE (AuthService.js - business logic)
   ↓
MODEL (UserModel.js - database access)
   ↓
DATABASE (MySQL)
   ↓
MODEL (return data)
   ↓
SERVICE (process result)
   ↓
CONTROLLER (format response)
   ↓
RESPONSE
```

## 📦 Modular Benefits

✅ **Separation of Concerns** - Each layer has single responsibility
✅ **Reusability** - Services used by multiple controllers
✅ **Testability** - Each module can be tested independently
✅ **Maintainability** - Easy to find and modify code
✅ **Scalability** - Easy to add new features
✅ **Error Handling** - Centralized exception handling
✅ **Code Organization** - Clear structure and conventions

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user profile

### Books
- `GET /api/books` - List books
- `GET /api/books/search?q=query` - Search
- `GET /api/books/:id` - Book details
- `POST /api/books` - Add book (Librarian+)
- `PUT /api/books/:id` - Update book (Librarian+)
- `DELETE /api/books/:id` - Delete book (Admin)

### Borrowing
- `POST /api/borrowing/checkout` - Checkout book
- `POST /api/borrowing/return` - Return book
- `GET /api/borrowing/my-books` - Active borrowings
- `GET /api/borrowing/history` - History

### Users
- `GET /api/users/profile` - Your profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - List users (Admin)
- `GET /api/users/:id` - User details

## 🛠️ Setting Up

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE lms_db;"

# Import schema
mysql -u root -p lms_db < database/schema.sql
```

### 3. Configure Environment
Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
JWT_SECRET=your_secret_key
```

### 4. Start Server
```bash
npm run dev
```

## 📊 Class Structure

### Models
- `UserModel` - User CRUD, find by email/ID
- `BookModel` - Book CRUD, search, find
- `BorrowingModel` - Checkout, return, history

### Services
- `AuthService` - Register, login
- `BookService` - CRUD, search operations
- `BorrowingService` - Checkout, return logic
- `UserService` - Profile, get users

### Controllers
- `AuthController` - Auth endpoints
- `BookController` - Book endpoints
- `BorrowingController` - Borrowing endpoints
- `UserController` - User endpoints

## ✨ Key Features

✅ JWT Authentication
✅ Role-Based Access Control
✅ Request Validation
✅ Global Error Handling
✅ Pagination
✅ Database Connection Pooling
✅ Modular Architecture
✅ Security Middleware (Helmet)
✅ Request Compression
✅ CORS Enabled
✅ Request Logging (Morgan)

## 🔒 Security

- Password hashing with bcryptjs
- JWT token authentication
- Role-based authorization
- Helmet for HTTP headers
- CORS protection
- Input validation
- SQL injection prevention

## 📈 Scalability

- Connection pooling for efficient DB access
- Separation of concerns for easy testing
- Modular services for code reuse
- Constants centralization
- Exception hierarchy for error handling

---

**Ready to use!** The system is now fully modular and production-ready. 🚀
