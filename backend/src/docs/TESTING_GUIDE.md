# 🧪 API Testing Guide

## Prerequisites

```bash
# Terminal 1: Start the server
cd backend
npm run dev

# You should see:
# Server running on http://localhost:5000
```

---

## Testing with cURL

### 1. Health Check (No Auth Required)
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1
  }
}
```

💾 **Save the token for next requests!**

---

### 4. Get Current User Profile

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member"
  }
}
```

---

### 5. Get All Books (No Auth Required)

```bash
curl http://localhost:5000/api/books
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasMore": false
  }
}
```

---

### 6. Search Books (No Auth Required)

```bash
curl "http://localhost:5000/api/books/search?q=javascript"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Search results retrieved",
  "data": [],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasMore": false
  }
}
```

---

### 7. Create a Book (Librarian+ Only)

First, register as a librarian (admin must set role in database):

```bash
# After login with librarian account:
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "isbn": "978-0596517748",
    "publishYear": 2008,
    "categoryId": 1,
    "totalCopies": 5
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "bookId": 1,
    "title": "JavaScript: The Good Parts"
  }
}
```

---

### 8. Get Book by ID (No Auth Required)

```bash
curl http://localhost:5000/api/books/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book retrieved successfully",
  "data": {
    "bookId": 1,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "isbn": "978-0596517748",
    "categoryId": 1,
    "availableCopies": 5,
    "totalCopies": 5
  }
}
```

---

### 9. Checkout Book

```bash
curl -X POST http://localhost:5000/api/borrowing/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bookId": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book checked out successfully",
  "data": {
    "borrowingId": 1,
    "bookId": 1,
    "checkoutDate": "2024-01-15",
    "dueDate": "2024-01-29",
    "status": "active"
  }
}
```

---

### 10. Get My Active Borrowed Books

```bash
curl http://localhost:5000/api/borrowing/my-books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Active borrowing records retrieved",
  "data": [
    {
      "borrowingId": 1,
      "bookId": 1,
      "title": "JavaScript: The Good Parts",
      "checkoutDate": "2024-01-15",
      "dueDate": "2024-01-29",
      "status": "active",
      "daysRemaining": 14
    }
  ]
}
```

---

### 11. Return a Book

```bash
curl -X POST http://localhost:5000/api/borrowing/return \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "borrowingId": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "borrowingId": 1,
    "returnDate": "2024-01-15",
    "fineAmount": 0,
    "status": "returned"
  }
}
```

---

### 12. Get Borrowing History

```bash
curl http://localhost:5000/api/borrowing/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Borrowing history retrieved",
  "data": [
    {
      "borrowingId": 1,
      "title": "JavaScript: The Good Parts",
      "checkoutDate": "2024-01-15",
      "returnDate": "2024-01-15",
      "dueDate": "2024-01-29",
      "fineAmount": 0,
      "status": "returned"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasMore": false
  }
}
```

---

## Testing with Postman (Easier GUI Option)

### Import Collection

1. Open Postman
2. Click **Import**
3. Choose **Raw text** tab
4. Paste the following JSON collection:

```json
{
  "info": {
    "name": "LMS API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/register",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"username\": \"john\", \"email\": \"john@test.com\", \"password\": \"pass123\", \"firstName\": \"John\", \"lastName\": \"Doe\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/login",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"john@test.com\", \"password\": \"pass123\"}"
            }
          }
        },
        {
          "name": "My Profile",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/auth/me",
            "header": [{"key": "Authorization", "value": "Bearer YOUR_TOKEN"}]
          }
        }
      ]
    },
    {
      "name": "Books",
      "item": [
        {
          "name": "Get All Books",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/books"
          }
        },
        {
          "name": "Search Books",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/books/search?q=javascript"
          }
        },
        {
          "name": "Get Book by ID",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/books/1"
          }
        }
      ]
    },
    {
      "name": "Borrowing",
      "item": [
        {
          "name": "Checkout Book",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/borrowing/checkout",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer YOUR_TOKEN"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"bookId\": 1}"
            }
          }
        },
        {
          "name": "Return Book",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/borrowing/return",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer YOUR_TOKEN"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"borrowingId\": 1}"
            }
          }
        },
        {
          "name": "My Books",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/borrowing/my-books",
            "header": [{"key": "Authorization", "value": "Bearer YOUR_TOKEN"}]
          }
        },
        {
          "name": "History",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/borrowing/history",
            "header": [{"key": "Authorization", "value": "Bearer YOUR_TOKEN"}]
          }
        }
      ]
    }
  ]
}
```

5. Click **Import**
6. Fill in YOUR_TOKEN with actual JWT token from login

---

## Common Test Flows

### Flow 1: Complete User Journey
```
1. Register             → Get userId
2. Login               → Get JWT token
3. Browse Books       → See available books
4. Search Books       → Find specific book
5. Checkout Book      → Borrow a book
6. View My Books      → See borrowed books
7. Return Book        → Return borrowed book
8. View History       → See borrowing history
```

### Flow 2: Admin Book Management
```
1. Login as admin/librarian
2. Create Book        → Add new book
3. View All Books     → Verify book listed
4. Update Book        → Modify book details
5. Delete Book        → Remove book
```

---

## Error Response Examples

### Invalid Email Format
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "invalid-email",
    "password": "pass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Missing Authorization
```bash
curl http://localhost:5000/api/borrowing/checkout \
  -H "Content-Type: application/json" \
  -d '{"bookId": 1}'
```

**Response (401):**
```json
{
  "success": false,
  "message": "No token provided",
  "error": "Unauthorized"
}
```

### Book Not Found
```bash
curl http://localhost:5000/api/books/999
```

**Response (404):**
```json
{
  "success": false,
  "message": "Book not found",
  "error": "NotFoundError"
}
```

---

## Tips for Testing

✅ **Save tokens** after login  
✅ **Use Postman Environment** to save variable tokens  
✅ **Test error cases** (invalid data, missing fields)  
✅ **Check HTTP status codes** (200, 201, 400, 401, 404, 500)  
✅ **Verify database changes** after operations  
✅ **Test pagination** with different page numbers  

---

Happy Testing! 🚀
