// backend/seedUsers.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const users = [
    {
        name: "Admin User",
        email: "admin@elegentmart.pk",
        phone: "0300-0000000",
        role: "admin",
        status: "Active",
        address: { city: "Karachi", state: "Sindh", country: "Pakistan" },
        emailVerified: true,
    },
    {
        name: "Ali Khan",
        email: "ali.khan@example.com",
        phone: "0301-1111111",
        role: "customer",
        status: "Active",
        address: { city: "Lahore", state: "Punjab", country: "Pakistan" },
        emailVerified: true,
    },
    {
        name: "Sara Ahmed",
        email: "sara.ahmed@example.com",
        phone: "0302-2222222",
        role: "customer",
        status: "Active",
        address: { city: "Islamabad", state: "ICT", country: "Pakistan" },
        emailVerified: true,
    },
];

async function run() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGODB_DB || "elegent-mart";
    try {
        await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB for seeding users...");
        // Upsert each user so seeding is idempotent and we can include hashed passwords
        for (const u of users) {
            const plainPassword = u.password || "Password123!"; // default password for seeded users
            const hashed = await bcrypt.hash(plainPassword, 10);

            const update = {
                $set: {
                    name: u.name,
                    phone: u.phone,
                    role: u.role,
                    status: u.status,
                    address: u.address,
                    emailVerified: u.emailVerified ?? false,
                },
                $setOnInsert: {
                    email: u.email,
                    password: hashed,
                },
            };

            const res = await User.updateOne({ email: u.email }, update, { upsert: true });
            if (res.upsertedCount > 0) {
                console.log(`✅ Inserted user ${u.email}`);
            } else if (res.matchedCount > 0) {
                console.log(`ℹ️ Updated user ${u.email}`);
            }
        }

        // --- Verification step (read-only): check stored hashed passwords match expected/plaintext
        console.log('\n🔎 Verifying stored hashed passwords for seeded users (read-only check)...');
        for (const u of users) {
            try {
                // Fetch user and include the password field (select: false by default)
                const dbUser = await User.findOne({ email: u.email }).select('+password');
                if (!dbUser) {
                    console.warn(`⚠️ User not found for verification: ${u.email}`);
                    continue;
                }

                const expected = u.password || "Password123!";
                if (!dbUser.password) {
                    console.warn(`⚠️ No password hash stored for ${u.email} — setting default password now`);
                    // set the plain password so User pre-save hook will hash it
                    dbUser.password = expected;
                    await dbUser.save();
                    console.log(`🔁 Default password set for ${u.email}`);
                }

                // refetch to get the stored hash and compare
                const refreshed = await User.findOne({ email: u.email }).select('+password');
                const match = await bcrypt.compare(expected, refreshed.password || '');
                if (match) {
                    console.log(`✅ Password verified for ${u.email} (matches expected)`);
                } else {
                    console.log(`❗ Password mismatch for ${u.email} (stored hash does NOT match expected).`);
                }
            } catch (verErr) {
                console.error(`❌ Verification error for ${u.email}:`, verErr.message);
            }
        }
    } catch (err) {
        console.error("❌ User seeding failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
