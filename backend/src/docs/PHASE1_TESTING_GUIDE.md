# 🧪 PHASE 1 TESTING GUIDE - 6 New Endpoints

## ⚡ Quick Setup Before Testing

### Step 1: Apply Database Schema
```bash
# Apply new tables for Phase 1
mysql -u root -p lms_db < database/schema_updates_phase1.sql
```

### Step 2: Update BorrowingRecords Table (if needed)
```bash
# Add renewal tracking column to existing borrowing_records
mysql -u root -p lms_db << 'EOF'
ALTER TABLE borrowing_records ADD COLUMN IF NOT EXISTS renewals_count INT DEFAULT 0;
EOF
```

### Step 3: Start Server
```bash
npm run dev
```

---

## 🔑 Test Accounts Setup

First, register test users:

```bash
# Register Member
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Register Librarian (ask admin to set role in DB)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "librarian",
    "email": "lib@example.com",
    "password": "password123",
    "first_name": "Lib",
    "last_name": "Admin"
  }'
```

Save the tokens from these registrations for testing!

---

## ✅ TEST 1: LOGOUT ENDPOINT

### Request
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "timestamp": "2024-03-27T12:00:00Z"
}
```

### Validation
- ✅ Token added to blacklist
- ✅ User cannot use old token anymore
- ✅ Subsequent requests with same token fail

### Verify Blacklist Works
```bash
# Try using the token again after logout
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_OLD_TOKEN"

# Should return 401 Unauthorized
```

---

## ✅ TEST 2: CHANGE PASSWORD ENDPOINT

### Prerequisite
- User must be logged in
- Must know current password

### Request
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456",
    "confirmPassword": "newpassword456"
  }'
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Password changed successfully",
  "timestamp": "2024-03-27T12:00:00Z"
}
```

### Error Cases
```bash
# Wrong current password
{
  "success": false,
  "message": "Current password is incorrect",
  "error": "AuthError"
}

# Passwords don't match
{
  "success": false,
  "message": "Passwords do not match",
  "error": "ValidationError"
}

# New password same as old
{
  "success": false,
  "message": "New password must be different from current password"
}
```

### Validation
- ✅ Old password verified
- ✅ New password must be different
- ✅ Passwords must match
- ✅ Notification created for user
- ✅ Can login with new password

### Test Login with New Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword456"
  }'
```

---

## ✅ TEST 3: FORGOT PASSWORD ENDPOINT

### Request (Public - No Auth Required)
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Reset link sent to email",
  "data": {
    "testToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-03-27T12:00:00Z"
}
```

### Note
- In development, token is returned for testing
- In production, token would be sent via email only

### Error Cases
```bash
# Email not found
{
  "success": false,
  "message": "Email not found in our system",
  "error": "NotFoundError"
}
```

### Validation
- ✅ Email exists in system
- ✅ Reset token generated (1 hour expiry)
- ✅ Token stored in database
- ✅ Email would be sent (in production)

**Save the testToken for the next step!**

---

## ✅ TEST 4: RESET PASSWORD ENDPOINT

### Prerequisite
- Must have reset token from TEST 3

### Request (Public - No Auth Required)
```bash
# Use the testToken from forgot-password response
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "newPassword": "resetpassword789",
    "confirmPassword": "resetpassword789"
  }'
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully",
  "timestamp": "2024-03-27T12:00:00Z"
}
```

### Error Cases
```bash
# Token invalid/expired
{
  "success": false,
  "message": "Reset token is invalid or expired",
  "error": "AuthError"
}

# Passwords don't match
{
  "success": false,
  "message": "Passwords do not match",
  "error": "ValidationError"
}

# Password too short
{
  "success": false,
  "message": "Password must be at least 6 characters",
  "error": "ValidationError"
}
```

### Validation
- ✅ Token valid and not expired
- ✅ Passwords match
- ✅ Password is strong (6+ chars)
- ✅ Reset token deleted after use
- ✅ User can login with new password

### Test Login with Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "resetpassword789"
  }'
```

---

## ✅ TEST 5: RENEW BOOK ENDPOINT

### Prerequisites
- User must be logged in
- User must have active borrowed book
- Book must not be overdue
- Book must not have pending reservations
- Cannot renew more than 2 times

### Setup - Checkout a Book First
```bash
# 1. Get a book ID
curl http://localhost:5000/api/books?limit=1 | grep book_id

# 2. Checkout the book
curl -X POST http://localhost:5000/api/borrowing/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": 1
  }'

# Save the borrowingId from response
```

### Request
```bash
curl -X POST http://localhost:5000/api/borrowing/renew \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "borrowId": BORROWING_ID_HERE
  }'
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Book renewed successfully",
  "data": {
    "newDueDate": "2024-04-10T00:00:00.000Z"
  },
  "timestamp": "2024-03-27T12:00:00Z"
}
```

### Error Cases
```bash
# Book overdue
{
  "success": false,
  "message": "Cannot renew overdue books. Please return and pay fines first.",
  "error": "ValidationError"
}

# Book has pending reservations
{
  "success": false,
  "message": "Cannot renew - book has pending reservations",
  "error": "ValidationError"
}

# Max renewals reached
{
  "success": false,
  "message": "Maximum 2 renewals reached",
  "error": "ValidationError"
}

# Borrowing record not found
{
  "success": false,
  "message": "Borrowing record not found",
  "error": "NotFoundError"
}
```

### Validation
- ✅ Book extended by 14 days
- ✅ Max 2 renewals enforced
- ✅ Notification created
- ✅ Cannot renew if overdue
- ✅ Cannot renew if book reserved

### Test Multiple Renewals
```bash
# First renewal should work
# Second renewal should work
# Third renewal should fail with "Maximum 2 renewals reached"
```

---

## ✅ TEST 6: PAY FINE ENDPOINT

### Prerequisites
- User must be logged in
- Borrowing record must have fine
- Fine must not be fully paid

### Setup - Create Overdue Book with Fine
```bash
# 1. Checkout a book as we did in TEST 5
# Let it become overdue naturally by waiting or manually updating database

mysql -u root -p lms_db << 'EOF'
-- Update a borrowing record to be overdue
UPDATE borrowing_records 
SET due_date = DATE_SUB(CURDATE(), INTERVAL 5 DAY),
    status = 'overdue',
    fine_amount = 50.00
WHERE borrow_id = 1;  -- Replace with actual borrow_id
EOF
```

### Request
```bash
curl -X POST http://localhost:5000/api/borrowing/BORROW_ID/pay-fine \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00
  }'
```

### Expected Response (201)
```json
{
  "success": true,
  "message": "Fine paid successfully",
  "data": {
    "receipt": {
      "transactionId": "TXN-1711533600000-abc123def",
      "bookTitle": "Clean Code",
      "amountPaid": 25.00,
      "remainingFine": 25.00
    }
  },
  "timestamp": "2024-03-27T12:00:00Z"
}
```

### Error Cases
```bash
# Invalid amount
{
  "success": false,
  "message": "Amount must be greater than 0",
  "error": "ValidationError"
}

# Amount exceeds fine
{
  "success": false,
  "message": "Fine amount is 50.00. Cannot pay more than owed.",
  "error": "ValidationError"
}

# Borrowing record not found
{
  "success": false,
  "message": "Borrowing record not found",
  "error": "NotFoundError"
}
```

### Validation
- ✅ Amount must be positive
- ✅ Amount cannot exceed fine
- ✅ Fine deducted from account
- ✅ Transaction ID generated
- ✅ Receipt returned
- ✅ Notification created
- ✅ Payment recorded

### Test Partial & Full Payment
```bash
# First payment of 25 out of 50
# Remaining should be 25
# Second payment of 25 should clear fine
# Third payment should fail (no fine remaining)
```

---

## 📊 Complete Test Flow

### Full User Journey
```
1. Register user
   ↓
2. Login (get token)
   ↓
3. Change password (optional)
   ↓
4. Checkout book
   ↓
5. Renew book (before overdue)
   ↓
6. Return book
   ↓
7. (Make it overdue with fine)
   ↓
8. Pay fine
   ↓
9. Logout
   ↓
10. Try old token (should fail - blacklisted)
```

---

## 📋 Postman Collection

### Create Postman Environment
```json
{
  "environment": {
    "name": "LMS Phase 1 Testing",
    "variables": [
      {
        "key": "BASE_URL",
        "value": "http://localhost:5000"
      },
      {
        "key": "TOKEN",
        "value": ""
      },
      {
        "key": "USER_EMAIL",
        "value": "test@example.com"
      },
      {
        "key": "BORROW_ID",
        "value": ""
      }
    ]
  }
}
```

### Test Collection Requests

**1. Logout**
```
POST {{BASE_URL}}/api/auth/logout
Headers: 
  Authorization: Bearer {{TOKEN}}
```

**2. Change Password**
```
POST {{BASE_URL}}/api/auth/change-password
Headers:
  Authorization: Bearer {{TOKEN}}
Body: {
  "currentPassword": "old_pwd",
  "newPassword": "new_pwd",
  "confirmPassword": "new_pwd"
}
```

**3. Forgot Password**
```
POST {{BASE_URL}}/api/auth/forgot-password
Body: {
  "email": "{{USER_EMAIL}}"
}
```

**4. Reset Password**
```
POST {{BASE_URL}}/api/auth/reset-password
Body: {
  "token": "paste_token_from_forgot",
  "newPassword": "reset_pwd",
  "confirmPassword": "reset_pwd"
}
```

**5. Renew Book**
```
POST {{BASE_URL}}/api/borrowing/renew
Headers:
  Authorization: Bearer {{TOKEN}}
Body: {
  "borrowId": {{BORROW_ID}}
}
```

**6. Pay Fine**
```
POST {{BASE_URL}}/api/borrowing/{{BORROW_ID}}/pay-fine
Headers:
  Authorization: Bearer {{TOKEN}}
Body: {
  "amount": 25.00
}
```

---

## 🎯 Success Criteria

All 6 endpoints are working if:

✅ Logout - Token blacklisted, cannot reuse  
✅ Change Password - New password works, old doesn't  
✅ Forgot Password - Token generated for reset  
✅ Reset Password - Password reset works  
✅ Renew Book - Due date extended, max 2 times  
✅ Pay Fine - Fine deducted, receipt generated  

---

## ⚠️ Important Notes

### Database Tables Required
- token_blacklist
- password_resets
- notifications (used for alerts)
- fine_payments
- All must be created before testing

### Token Expiry
- User tokens expire in 7 days
- Reset tokens expire in 1 hour
- Blacklist cleaned daily

### Email Not Implemented
- In production, forgot-password would send email
- For testing, token is returned in response
- Remove testToken from production

### Fine Calculation
- Fine = days_overdue × FINE_PER_DAY (10 per day)
- Automatically calculated on return

---

## 🚀 Next Steps After Phase 1 Testing

1. Deploy to staging
2. Test with real users
3. Implement email notifications (for forgot-password)
4. Implement Phase 2 endpoints (notifications, reviews)
5. Full production deployment

---

**All 6 Phase 1 endpoints are now ready for testing!** 🎉
