// backend/seedNotifications.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Notification from "./models/Notification.js";

dotenv.config();

async function run() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGODB_DB || "elegent-mart";
    try {
        await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB for seeding notifications...");

        const admin = await User.findOne({ role: "admin" });
        const customer = await User.findOne({ role: "customer" });

        const docs = [
            {
                title: "Holiday Sale!",
                message: "Get up to 30% off on selected items.",
                audience: "All Customers",
                channel: "app",
                status: "Sent",
                createdBy: admin?._id,
            },
            {
                title: "We miss you",
                message: "Come back and enjoy 10% off your next order.",
                audience: "Inactive Customers",
                channel: "email",
                status: "Sent",
                createdBy: admin?._id,
            },
            {
                title: "Order update",
                message: "Your order has been delivered.",
                audience: "Specific User",
                targetUser: customer?._id,
                channel: "sms",
                status: "Sent",
                createdBy: admin?._id,
            },
        ];

        const count = await Notification.countDocuments();
        if (count === 0) {
            const created = await Notification.insertMany(docs);
            console.log(`✅ Seeded ${created.length} notifications.`);
        } else {
            console.log(`ℹ️ Notifications already exist (count=${count}). Skipping.`);
        }
    } catch (err) {
        console.error("❌ Notification seeding failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
