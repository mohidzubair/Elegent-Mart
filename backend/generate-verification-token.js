import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "./models/User.js";

dotenv.config();

const generateToken = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB || "elegent-mart",
        });
        console.log("✅ Connected to MongoDB\n");

        // Get email from command line argument or use default
        const email = process.argv[2] || "mohidbinzubair792@gmail.com";

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            console.log(`\n💡 Tip: Provide email as argument:`);
            console.log(`   node generate-verification-token.js your-email@example.com\n`);
            process.exit(1);
        }

        console.log(`👤 User found: ${user.name} (${user.email})`);
        console.log(`📊 Current status:`);
        console.log(`   - Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   - Has Token: ${user.verificationToken ? '✅ Yes' : '❌ No'}`);
        console.log(``);

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = verificationToken;
        user.emailVerified = false; // Reset verification status for testing
        await user.save();

        console.log(`✅ Generated NEW verification token for: ${email}`);
        console.log(`⚠️  Email verification reset to: false (for testing)\n`);
        console.log(`📧 Verification Link:`);
        console.log(`\x1b[36m%s\x1b[0m`, `http://localhost:5173/verify-email/${verificationToken}`);
        console.log(`\n✨ Copy and paste this link in your browser to test email verification!\n`);
        console.log(`🔍 What to test:`);
        console.log(`   1. Click the link above → Should verify successfully`);
        console.log(`   2. Click the SAME link again → Should say "already verified"`);
        console.log(`   3. Login with this account → Should work after verification\n`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

generateToken();
