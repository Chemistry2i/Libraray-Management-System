# 🚨 MISSING ENDPOINTS ANALYSIS & RECOMMENDATIONS

## Current Status: 32 Endpoints (Incomplete)

Your system is **missing critical functionality** for production use. Let's fix this! 

---

## 🔴 CRITICAL MISSING ENDPOINTS

### 1. AUTHENTICATION - MISSING 5 ENDPOINTS

**Currently Have:**
```
✓ POST   /api/auth/register
✓ POST   /api/auth/login
✓ GET    /api/auth/me
```

**MISSING - MUST ADD:**

#### 1.1 Logout Endpoint
```
POST /api/auth/logout
Status: PROTECTED (All users)
Purpose: Invalidate user session
Response: 200 { message: "Logged out successfully" }
Implementation: Add token to blacklist
```

#### 1.2 Change Password
```
POST /api/auth/change-password
Status: PROTECTED (All users)
Body: {
  "currentPassword": "old_pass",
  "newPassword": "new_pass",
  "confirmPassword": "new_pass"
}
Response: 200 { message: "Password changed" }
Validation: Old password must match
```

#### 1.3 Forgot Password (Send Reset Email)
```
POST /api/auth/forgot-password
Status: PUBLIC
Body: { "email": "user@example.com" }
Response: 200 { message: "Reset link sent to email" }
Implementation: Generate reset token, send email
```

#### 1.4 Reset Password (With Token)
```
POST /api/auth/reset-password
Status: PUBLIC
Body: {
  "token": "reset_token_from_email",
  "newPassword": "new_pass",
  "confirmPassword": "new_pass"
}
Response: 200 { message: "Password reset successfully" }
Validation: Token must be valid + non-expired
```

#### 1.5 Refresh Token
```
POST /api/auth/refresh
Status: PUBLIC
Body: { "token": "current_token" }
Response: 200 { newToken, expiresIn }
Purpose: Get new token before expiration
Validation: Token must not be expired (within 24hrs)
```

---

### 2. PROFILE/USER - MISSING 3 ENDPOINTS

**Currently Have:**
```
✓ GET    /api/users/profile
✓ PUT    /api/users/profile
✓ GET    /api/users (admin)
```

**MISSING:**

#### 2.1 Upload Profile Picture
```
POST /api/users/profile/picture
Status: PROTECTED
Upload: FormData (multipart/form-data)
Response: 200 { profilePictureUrl }
Implementation: Store in uploads/ folder
```

#### 2.2 Delete Account (Self-Service)
```
DELETE /api/users/profile
Status: PROTECTED
Body: { "password": "confirm_password" }
Response: 200 { message: "Account deleted" }
Validation: Must confirm password
```

#### 2.3 User Activity Log (View own)
```
GET /api/users/activity-log
Status: PROTECTED
Response: 200 [{ timestamp, action, details }]
Example: Login at X, Borrowed book Y, etc
```

---

### 3. BORROWING - MISSING 3 ENDPOINTS

**Currently Have:**
```
✓ POST   /api/borrowing/checkout
✓ POST   /api/borrowing/return
✓ GET    /api/borrowing/my-books
✓ GET    /api/borrowing/history
```

**MISSING:**

#### 3.1 Renew Book (Extend Due Date)
```
POST /api/borrowing/renew
Status: PROTECTED
Body: { "borrowingId": 5 }
Response: 200 { newDueDate }
Business Logic:
  - Can only renew if not overdue
  - Max 2 renewals per book
  - Cannot renew if someone reserved it
```

#### 3.2 Check if Overdue & Calculate Fine
```
GET /api/borrowing/:borrowingId/status
Status: PROTECTED
Response: 200 {
  status, daysOverdue, fine,
  canRenew, isReserved, renewsLeft
}
```

#### 3.3 Mark Fine as Paid
```
POST /api/borrowing/:borrowingId/pay-fine
Status: PROTECTED
Body: { "amount": 50.00 }
Response: 200 { 
  message: "Fine paid",
  receipt: { transactionId, date, amount }
}
```

---

### 4. NOTIFICATIONS - MISSING (NEW FEATURE)

#### 4.1 Get All Notifications
```
GET /api/notifications
Status: PROTECTED
Response: 200 [
  {
    notificationId, type, message,
    read, createdAt
  }
]
Example: "Book 'Clean Code' is reserved for you"
```

#### 4.2 Mark Notification as Read
```
PATCH /api/notifications/:id/read
Status: PROTECTED
Response: 200 { success }
```

#### 4.3 Delete Notification
```
DELETE /api/notifications/:id
Status: PROTECTED
Response: 200 { success }
```

#### 4.4 Get Unread Count
```
GET /api/notifications/unread/count
Status: PROTECTED
Response: 200 { unreadCount: 5 }
```

---

### 5. BOOKS - MISSING 3 ENDPOINTS

**Currently Have:**
```
✓ GET    /api/books
✓ GET    /api/books/search
✓ GET    /api/books/:id
✓ POST   /api/books
✓ PUT    /api/books/:id
✓ DELETE /api/books/:id
```

**MISSING:**

#### 5.1 Get Book Reviews/Ratings
```
GET /api/books/:id/reviews
Status: PUBLIC
Response: 200 [
  {
    reviewId, userId, username, rating,
    comment, date, helpful
  }
]
```

#### 5.2 Create Book Review
```
POST /api/books/:id/reviews
Status: PROTECTED
Body: {
  "rating": 4,
  "comment": "Great book!"
}
Response: 201 { reviewId }
Requirement: User must have borrowed the book
```

#### 5.3 Add/Remove from Wishlist
```
POST   /api/books/:id/wishlist      Add to wishlist
DELETE /api/books/:id/wishlist      Remove from wishlist
Status: PROTECTED
Response: 200 { message }
```

---

### 6. ADMIN/LIBRARIAN - MISSING ENDPOINTS

#### 6.1 System Settings/Configuration
```
GET    /api/admin/settings
PUT    /api/admin/settings
Status: PROTECTED (Admin)
Data: BorrowPeriod, FinePerDay, MaxRenewals, etc
```

#### 6.2 User Management - Block/Ban User
```
POST /api/admin/users/:id/block
POST /api/admin/users/:id/unblock
Status: PROTECTED (Admin)
Response: 200 { message, reason }
Purpose: Block user due to overdue fines
```

#### 6.3 Bulk Book Import
```
POST /api/admin/books/import
Status: PROTECTED (Librarian+)
Upload: CSV file with book data
Response: 201 { imported: 100, failed: 2 }
```

#### 6.4 Export Data (Reports)
```
GET /api/admin/export/members
GET /api/admin/export/books
GET /api/admin/export/borrowing
Status: PROTECTED (Admin)
Response: CSV file download
```

#### 6.5 Activity Log (System-wide)
```
GET /api/admin/activity-logs
Status: PROTECTED (Admin)
Response: 200 [{ userId, action, timestamp }]
```

---

### 7. STATISTICS/REPORTING - MISSING

#### 7.1 Member Statistics
```
GET /api/stats/my-profile
Status: PROTECTED
Response: 200 {
  totalBorrowed, currentlyBorrowing,
  overdue, fines, wishlist,
  reservations, joinDate
}
```

#### 7.2 Library Statistics (Public)
```
GET /api/stats/library
Status: PUBLIC
Response: 200 {
  totalBooks, totalMembers,
  booksAvailable, mostBorrowed,
  popularCategories
}
```

#### 7.3 Generate Custom Report
```
POST /api/reports/generate
Status: PROTECTED (Librarian+)
Body: {
  "type": "member-activity",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "format": "pdf|csv"
}
Response: 201 { reportId, downloadUrl }
```

---

## 📊 COMPLETE MISSING ENDPOINTS SUMMARY

### Authentication Missing: **5**
```
❌ POST   /api/auth/logout
❌ POST   /api/auth/change-password
❌ POST   /api/auth/forgot-password
❌ POST   /api/auth/reset-password
❌ POST   /api/auth/refresh
```

### Users/Profile Missing: **3**
```
❌ POST   /api/users/profile/picture         (upload)
❌ DELETE /api/users/profile                 (delete account)
❌ GET    /api/users/activity-log
```

### Borrowing Missing: **3**
```
❌ POST   /api/borrowing/renew
❌ GET    /api/borrowing/:id/status
❌ POST   /api/borrowing/:id/pay-fine
```

### Books Missing: **3**
```
❌ GET    /api/books/:id/reviews             (get reviews)
❌ POST   /api/books/:id/reviews             (create review)
❌ POST   /api/books/:id/wishlist            (wishlist management)
```

### Notifications Missing: **4**
```
❌ GET    /api/notifications
❌ PATCH  /api/notifications/:id/read
❌ DELETE /api/notifications/:id
❌ GET    /api/notifications/unread/count
```

### Admin Missing: **5**
```
❌ GET    /api/admin/settings
❌ PUT    /api/admin/settings
❌ POST   /api/admin/users/:id/block
❌ POST   /api/admin/books/import
❌ GET    /api/admin/export/:type
```

### Reports/Stats Missing: **3**
```
❌ GET    /api/stats/my-profile
❌ GET    /api/stats/library
❌ POST   /api/reports/generate
```

### Activity Logs Missing: **2**
```
❌ GET    /api/users/activity-log           (user's own)
❌ GET    /api/admin/activity-logs          (system-wide)
```

---

## 🎯 PRIORITY IMPLEMENTATION ORDER

### **PHASE 1: CRITICAL (DO FIRST)** - Must have for basic functionality
```
Priority 1 (Essential):
1. ✅ GET    /api/auth/logout
2. ✅ POST   /api/auth/change-password
3. ✅ POST   /api/auth/forgot-password
4. ✅ POST   /api/auth/reset-password
5. ✅ POST   /api/borrowing/renew
6. ✅ POST   /api/borrowing/:id/pay-fine

Expected: 6-8 endpoints
Time: 2-3 hours
```

### **PHASE 2: IMPORTANT (HIGH PRIORITY)**
```
Priority 2 (High):
1. ✅ GET    /api/notifications
2. ✅ POST   /api/notifications/:id/read
3. ✅ POST   /api/books/:id/reviews
4. ✅ POST   /api/admin/users/:id/block
5. ✅ POST   /api/users/profile/picture

Expected: 5+ endpoints
Time: 2-3 hours
```

### **PHASE 3: NICE-TO-HAVE (MEDIUM PRIORITY)**
```
Priority 3 (Medium):
1. POST   /api/auth/refresh
2. GET    /api/stats/my-profile
3. POST   /api/admin/settings
4. DELETE /api/users/profile
5. POST   /api/admin/books/import

Expected: 5+ endpoints
Time: 2-3 hours
```

---

## ✅ RECOMMENDATION: Start with PHASE 1

### Why?
- **Logout** - Users need to logout
- **Change Password** - Security critical
- **Password Reset** - Essential user experience
- **Renew Books** - Core library feature
- **Pay Fines** - Revenue critical

These 6 endpoints address fundamental use cases currently missing.

---

## 📋 PROPOSED NEW TOTAL

Current: 32 endpoints  
After Phase 1: **38 endpoints**  
After Phase 2: **43 endpoints**  
After Phase 3: **50+ endpoints**  

**PRODUCTION READY:** 43+ endpoints

---

## 🔄 Implementation Strategy

### Step 1: Create Missing Models
```
- TokenBlacklistModel.js       (for logout)
- NotificationModel.js         (for notifications)
- ReviewModel.js              (for ratings)
- SettingsModel.js            (for config)
```

### Step 2: Create Missing Services
```
- PasswordService.js          (password reset logic)
- NotificationService.js      (notification management)
- ReviewService.js            (review logic)
- SettingsService.js          (settings management)
```

### Step 3: Create Missing Controllers
```
- Update AuthController.js    (add new methods)
- NotificationController.js   (notification handlers)
- ReviewController.js         (review handlers)
- SettingsController.js       (settings handlers)
```

### Step 4: Create Routes
```
- Update authRoutes.js        (add new auth endpoints)
- Create notificationRoutes.js
- Create reviewRoutes.js
- Create settingsRoutes.js
```

---

## 💾 Database Schema Updates Needed

### New Table: token_blacklist
```sql
CREATE TABLE token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500),
  user_id INT,
  blacklisted_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### New Table: notifications
```sql
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

### New Table: reviews
```sql
CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT,
  user_id INT,
  rating INT (1-5),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);
```

### New Table: wishlist
```sql
CREATE TABLE wishlist (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  added_at TIMESTAMP,
  UNIQUE(user_id, book_id)
);
```

### New Table: system_settings
```sql
CREATE TABLE system_settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP
);
```

### New Table: activity_logs
```sql
CREATE TABLE activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  details JSON,
  timestamp TIMESTAMP
);
```

---

## 🎯 What Should We Implement First?

### **I recommend implementing these 6 CRITICAL endpoints:**

1. **POST /api/auth/logout** ⚡
2. **POST /api/auth/change-password** ⚡
3. **POST /api/auth/forgot-password** ⚡
4. **POST /api/auth/reset-password** ⚡
5. **POST /api/borrowing/renew** ⚡
6. **POST /api/borrowing/:id/pay-fine** ⚡

These are **production-critical** and will make your system **actually functional**.

---

## ❓ Would you like me to implement:

- [ ] All 6 critical Phase 1 endpoints?
- [ ] Plus Phase 2 (notifications + reviews + blocking)?
- [ ] Full 43+ endpoints (all phases)?

**Choose one and I'll build it out completely!** Let me know which priority level you want! 🚀
