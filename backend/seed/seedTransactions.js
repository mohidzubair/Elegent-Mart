// backend/seedTransactions.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Order from "./models/Order.js";
import Transaction from "./models/Transaction.js";

dotenv.config();

async function run() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGODB_DB || "elegent-mart";
    try {
        await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB for seeding transactions...");

        const order = await Order.findOne({}).populate("user");
        if (!order) throw new Error("No order found. Seed orders first.");
        const user = order.user;

        const txnDoc = {
            order: order._id,
            user: user._id,
            amount: order.totalPrice,
            currency: "PKR",
            method: "Cash",
            status: "Success",
            reference: `TXN-${Date.now()}`,
            processedAt: new Date(),
        };

        const count = await Transaction.countDocuments();
        if (count === 0) {
            const created = await Transaction.create(txnDoc);
            order.transaction = created._id;
            await order.save();
            console.log(`✅ Seeded 1 transaction ${created._id} for order ${order._id}.`);
        } else {
            console.log(`ℹ️ Transactions already exist (count=${count}). Skipping.`);
        }
    } catch (err) {
        console.error("❌ Transaction seeding failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
