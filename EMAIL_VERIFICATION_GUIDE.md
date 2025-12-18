# 📧 Email Verification Testing Guide

## ✅ Complete Email Verification Flow

### **Step 1: Start Your Servers**

#### Backend:

```bash
cd backend
node index.js
```

**Expected output:**

```
✅ MongoDB connected (elegent-mart)
🚀 Server running on port 5000
```

#### Frontend:

```bash
cd frontend
npm run dev
```

**Expected output:**

```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### **Step 2: Sign Up New User**

1. **Go to:** http://localhost:5173/signup

2. **Fill in the form:**

   - Name: `John Doe`
   - Email: `YOUR_REAL_EMAIL@gmail.com` ⚠️ Use your actual email!
   - Password: `Test123!`
   - Confirm Password: `Test123!`
   - Phone: `1234567890` (optional)

3. **Click "Sign Up"**

4. **You should see:**
   - ✅ Green success message: "Account Created Successfully!"
   - 📧 "Please check your email (YOUR_EMAIL) for a verification link"
   - 🔄 "Redirecting to login in 5 seconds..."

---

### **Step 3: Check Backend Console**

**You should see:**

```
✅ Verification email sent to YOUR_EMAIL@gmail.com
```

**If you see a warning instead:**

```
⚠️ Verification email send failed for YOUR_EMAIL@gmail.com: [error]
```

→ Check your SMTP credentials in `.env`

---

### **Step 4: Check Your Email Inbox**

1. **Open your email inbox**
2. **Look for email from:** `Elegant Mart`
3. **Subject:** `✅ Verify Your Email - Elegant Mart`
4. **Email contains:**
   - Welcome message with your name
   - Big red "Verify Email Address" button
   - Link you can copy if button doesn't work

---

### **Step 5: Click Verification Link**

**Click the "Verify Email Address" button or link**

**You should see:**

1. ⏳ **Loading screen** (2-3 seconds)

   - Spinner animation
   - "Verifying Email"
   - "Please wait while we verify your email address..."

2. ✅ **Success screen**
   - Green checkmark
   - "Email Verified!"
   - "Email verified successfully! Redirecting to login..."
   - Auto-redirect to login after 4 seconds

---

### **Step 6: Login**

1. **On the login page**, enter:

   - Email: `YOUR_EMAIL@gmail.com`
   - Password: `Test123!`

2. **Click "Login"**

3. **You should be:**
   - ✅ Logged in successfully
   - ✅ Redirected to homepage
   - ✅ See your name in the navbar (click profile icon)

---

## 🧪 Test Cases

### ✅ **Test Case 1: First-Time Verification**

- Click fresh verification link
- Should see loading → success → redirect

### ✅ **Test Case 2: Already Verified**

- Click the same verification link again
- Should see: "Email already verified. You can now login."

### ❌ **Test Case 3: Invalid Token**

- Modify the token in URL manually
- Should see: "Invalid or expired verification token..."

### ❌ **Test Case 4: Login Without Verification**

- Create new user
- Try to login WITHOUT clicking verification link
- Should see error: "Email not verified"

---

## 📋 Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] SMTP credentials configured in `.env`
- [ ] Can access signup page
- [ ] Form validation works
- [ ] Signup creates user in database
- [ ] Verification email is sent
- [ ] Email has proper formatting
- [ ] Verification link works
- [ ] Loading state shows (2-3 seconds)
- [ ] Success message displays
- [ ] Auto-redirect to login works
- [ ] Login blocked for unverified users
- [ ] Login works after verification
- [ ] User name appears in navbar

---

## 🐛 Troubleshooting

### **Email not received?**

1. Check spam/junk folder
2. Verify SMTP credentials in `.env`
3. Check backend console for errors
4. Make sure you removed spaces from SMTP password

### **"Invalid verification token" error?**

1. Token might be expired (already used)
2. Generate fresh token: `node generate-verification-token.js`
3. Or sign up with a new email

### **Can't login after verification?**

1. Check backend console for errors
2. Verify MongoDB connection
3. Make sure emailVerified was set to true in database

---

## 🎯 Expected Email Template

```html
Subject: ✅ Verify Your Email - Elegant Mart
┌──────────────────────────────────────┐ │ Welcome to Elegant Mart! 🎉 │
└──────────────────────────────────────┘ Hi John Doe! 👋 Thank you for signing
up with Elegant Mart. To complete your registration and start shopping, please
verify your email address: ┌──────────────────────────────────────┐ │ [Verify
Email Address] │ ← Click here └──────────────────────────────────────┘ If button
doesn't work, use this link: http://localhost:5173/verify-email/abc123...
```

---

## 📊 Backend Logs Reference

**Successful flow:**

```
✅ MongoDB connected (elegent-mart)
🚀 Server running on port 5000
✅ Verification email sent to user@email.com
✅ Email verified for: user@email.com
```

**Login attempt (unverified):**

```
User tried to login but email not verified
```

**Login attempt (verified):**

```
User logged in successfully: user@email.com
```

---

## 🚀 Quick Commands

```bash
# Start backend
cd backend && node index.js

# Start frontend
cd frontend && npm run dev

# Test email configuration
cd backend && node test-email.js

# Generate new verification token
cd backend && node generate-verification-token.js

# View MongoDB users
# Use MongoDB Compass or:
mongosh "YOUR_MONGODB_URI" --eval "db.users.find().pretty()"
```

---

**✨ You're all set! Happy testing!** 🎉
