import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const checkTokens = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB || "elegent-mart",
        });
        console.log("✅ Connected to MongoDB\n");

        // Find all users with verification tokens
        const usersWithTokens = await User.find({ verificationToken: { $exists: true, $ne: null } });

        console.log(`📊 Users with verification tokens: ${usersWithTokens.length}\n`);

        if (usersWithTokens.length === 0) {
            console.log("ℹ️  No users have pending verification tokens.");
            console.log("This means all users are either verified or have no tokens set.\n");
        } else {
            usersWithTokens.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
                console.log(`   Token (first 20 chars): ${user.verificationToken.substring(0, 20)}...`);
                console.log(`   Full Token: ${user.verificationToken}`);
                console.log(`   Token Length: ${user.verificationToken.length} characters`);
                console.log(`   \n   🔗 Verification Link:`);
                console.log(`   \x1b[36m%s\x1b[0m`, `   http://localhost:5173/verify-email/${user.verificationToken}`);
                console.log(``);
            });

            console.log(`\n💡 Copy the link above and paste it in your browser to verify!`);
        }

        // Also show all users
        const allUsers = await User.find({}).select('name email emailVerified verificationToken');
        console.log(`\n📋 All Users (${allUsers.length}):`);
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
            console.log(`   Has Token: ${user.verificationToken ? '✅ Yes' : '❌ No'}`);
            console.log(``);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

checkTokens();
