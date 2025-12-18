# 🔐 Admin Login Guide

## Admin Credentials

### **Default Admin Account:**

```
Email: admin@elegentmart.pk
Password: Password123!
Role: admin
```

---

## 🎯 How It Works

### **Login Flow:**

1. **Customer Login:**

   - Email: `customer@example.com`
   - Password: `Password123!`
   - ➡️ Redirects to: **Homepage** (`/`)

2. **Admin Login:**
   - Email: `admin@elegentmart.pk`
   - Password: `Password123!`
   - ➡️ Redirects to: **Admin Portal** (`/admin`)

---

## 📋 All Seeded User Accounts

### **1. Admin User**

```
Email: admin@elegentmart.pk
Password: Password123!
Role: admin
Email Verified: ✅ Yes
```

### **2. Ali Khan (Customer)**

```
Email: ali.khan@example.com
Password: Password123!
Role: customer
Email Verified: ✅ Yes
```

### **3. Sara Ahmed (Customer)**

```
Email: sara.ahmed@example.com
Password: Password123!
Role: customer
Email Verified: ✅ Yes
```

---

## 🧪 Testing Admin Access

### **Test Steps:**

1. **Go to Login Page:**

   ```
   http://localhost:5173/login
   ```

2. **Enter Admin Credentials:**

   - Email: `admin@elegentmart.pk`
   - Password: `Password123!`

3. **Click "Login"**

4. **You should be redirected to:**

   ```
   http://localhost:5173/admin
   ```

5. **You should see the Admin Portal** with:
   - Dashboard
   - Orders Management
   - Products Inventory
   - Customer Management
   - Analytics Reports
   - Transactions
   - Notifications

---

## 🔧 How Admin Redirect Works

### **Backend (`authController.js`):**

```javascript
// Login returns user object with role
res.json({
  message: "Login successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role, // 'admin' or 'customer'
  },
});
```

### **Frontend (`Login.jsx`):**

```javascript
// Check user role and redirect accordingly
if (json.user && json.user.role === "admin") {
  navigate("/admin"); // Admin Portal
} else {
  navigate("/"); // Homepage
}
```

---

## 🛡️ Security Notes

⚠️ **Important:**

- All seeded users have the same default password: `Password123!`
- **Change admin password in production!**
- Email verification is **required** for new signups
- Seeded users are **pre-verified** for easier testing

---

## 📝 Creating New Admin User

### **Option 1: Direct Database Insert**

```javascript
// In MongoDB or using a script
{
  name: "New Admin",
  email: "newadmin@elegentmart.pk",
  password: "hashed_password_here",
  role: "admin",
  emailVerified: true,
  status: "Active"
}
```

### **Option 2: Update Existing User**

```javascript
// MongoDB query
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } });
```

### **Option 3: Add to Seed File**

Edit `backend/seed/seedUsers.js` and add:

```javascript
{
  name: "New Admin",
  email: "newadmin@elegentmart.pk",
  phone: "0300-0000001",
  role: "admin",  // ← Set role to admin
  status: "Active",
  emailVerified: true,
}
```

Then run:

```bash
cd backend
node seed/seedUsers.js
```

---

## 🔍 Verify User Role

### **Check in MongoDB:**

```javascript
db.users.find({ role: "admin" });
```

### **Check in Browser Console:**

After login, in browser console:

```javascript
JSON.parse(localStorage.getItem("authUser"));
// Should show: { id: "...", name: "...", email: "...", role: "admin" }
```

---

## 🚀 Quick Test

### **Test Admin Access:**

```bash
# 1. Make sure backend is running
cd backend
node index.js

# 2. Make sure frontend is running
cd frontend
npm run dev

# 3. Go to login page
http://localhost:5173/login

# 4. Login with admin credentials
Email: admin@elegentmart.pk
Password: Password123!

# 5. Should redirect to:
http://localhost:5173/admin
```

### **Test Customer Access:**

```bash
# Login with customer credentials
Email: ali.khan@example.com
Password: Password123!

# Should redirect to:
http://localhost:5173/
```

---

## ✅ Expected Behavior

| User Type      | Login Email          | Redirect To      | Access                  |
| -------------- | -------------------- | ---------------- | ----------------------- |
| **Admin**      | admin@elegentmart.pk | `/admin`         | Full admin portal       |
| **Customer**   | ali.khan@example.com | `/`              | Homepage, shopping      |
| **Unverified** | Any new signup       | ❌ Login blocked | Must verify email first |

---

**🎉 You're all set! Login as admin and test the admin portal!**
