

import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// ----------------- SIGNUP -----------------
export const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        // Create user (password will be hashed by User pre-save hook)
        const user = await User.create({
            name,
            email,
            password,
            phone,
            emailVerified: false, // Optional: set true if no email verification
        });

        // Optional: send verification email
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = verificationToken;
        await user.save();

        // Send verification email (non-fatal in dev)
        const verificationURL = `http://localhost:5173/verify-email/${verificationToken}`;
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_USER || "yourEmail@gmail.com",
                    pass: process.env.SMTP_PASS || "yourAppPassword",
                },
            });
            await transporter.sendMail({
                from: `"Elegant Mart" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: "✅ Verify Your Email - Elegant Mart",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: #dc3545; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">Welcome to Elegant Mart! 🎉</h1>
                        </div>
                        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #333;">Hi ${user.name}! 👋</h2>
                            <p style="color: #666; line-height: 1.6;">
                                Thank you for signing up with Elegant Mart. To complete your registration and start shopping, 
                                please verify your email address by clicking the button below:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationURL}" 
                                   style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                    Verify Email Address
                                </a>
                            </div>
                            <p style="color: #999; font-size: 12px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="${verificationURL}" style="color: #dc3545; word-break: break-all;">${verificationURL}</a>
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                If you didn't create an account with Elegant Mart, please ignore this email.
                            </p>
                        </div>
                    </div>
                `,
            });
            console.log(`✅ Verification email sent to ${user.email}`);
        } catch (mailErr) {
            // Log but do not fail signup if email cannot be sent (useful in dev)
            console.warn(`⚠️ Verification email send failed for ${user.email}:`, mailErr.message);
        }

        res.status(201).json({
            message: "Account created successfully! Please check your email to verify your account.",
            email: user.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ----------------- LOGIN -----------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        if (!user.emailVerified) {
            return res.status(403).json({ message: "Email not verified" });
        }

        // Generate JWT and set as httpOnly cookie
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret-change-in-production',
            { expiresIn: "7d" }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        }).json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ----------------- FORGOT PASSWORD -----------------
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "yourEmail@gmail.com",
                pass: "yourAppPassword",
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset.</p>
             <p>Click here to reset: <a href="${resetURL}">${resetURL}</a></p>`,
        });

        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ----------------- RESET PASSWORD -----------------
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.password = password; // will be hashed by pre-save hook
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ----------------- VERIFY EMAIL (OPTIONAL) -----------------
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        console.log(`\n========== EMAIL VERIFICATION REQUEST ==========`);
        console.log(`📧 Token received: ${token.substring(0, 20)}...`);
        console.log(`📊 Token length: ${token.length} characters`);
        console.log(`🔍 Full token: ${token}`);

        // Add 2-3 second delay for better UX (showing loading state)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // First, try to find user by verification token
        console.log(`🔎 Searching database for user with this token...`);
        let user = await User.findOne({ verificationToken: token });

        // If no user found by token, the token might have been used already
        if (!user) {
            console.log(`❌ No user found with verification token`);
            console.log(`💡 This could mean:`);
            console.log(`   1. Token was already used and cleared`);
            console.log(`   2. Token doesn't match what's in database`);
            console.log(`   3. User was deleted`);

            // Let's check if ANY user has a token
            const anyUserWithToken = await User.findOne({ verificationToken: { $exists: true, $ne: null } });
            if (anyUserWithToken) {
                console.log(`🔍 Found another user with token:`);
                console.log(`   Email: ${anyUserWithToken.email}`);
                console.log(`   Their token: ${anyUserWithToken.verificationToken.substring(0, 20)}...`);
                console.log(`   Match: ${anyUserWithToken.verificationToken === token ? '✅ YES' : '❌ NO'}`);
            }
            console.log(`================================================\n`);

            return res.status(400).json({
                message: "This verification link has already been used or has expired. If you already verified your email, please try logging in."
            });
        }

        console.log(`✅ Found user: ${user.email}`);
        console.log(`📊 User status:`);
        console.log(`   - Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   - Account Status: ${user.status}`);

        // Check if user is already verified (token still exists but user is verified)
        if (user.emailVerified) {
            console.log(`⚠️  User already verified: ${user.email}`);
            // Clear the token since verification is complete
            user.verificationToken = undefined;
            await user.save();
            console.log(`🗑️  Token cleared from database`);
            console.log(`================================================\n`);

            return res.status(200).json({
                message: "Your email is already verified! You can now login to your account.",
                alreadyVerified: true
            });
        }

        // Verify the user for the first time
        console.log(`🎉 Verifying user for the first time...`);
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.status = "Active"; // Ensure user is active
        await user.save();

        console.log(`✅ Email verified successfully for: ${user.email}`);
        console.log(`📝 Changes saved to database`);
        console.log(`================================================\n`);

        res.json({ message: "Email verified successfully! You can now login to your account." });
    } catch (error) {
        console.error("❌ Verification error:", error);
        console.log(`================================================\n`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ----------------- LOGOUT -----------------
export const logout = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0
        }).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ----------------- PROFILE (get current user from cookie) -----------------
export const profile = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production', {}, async (err, decoded) => {
            if (err) return res.status(401).json({ message: "Invalid token" });

            const user = await User.findById(decoded.id).select('-password');
            if (!user) return res.status(404).json({ message: "User not found" });

            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};
