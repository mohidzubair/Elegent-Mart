// backend/seedAnalytics.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import AnalyticsSnapshot from "./models/AnalyticsSnapshot.js";

dotenv.config();

async function run() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGODB_DB || "elegent-mart";
    try {
        await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB for seeding analytics snapshot...");

        const products = await Product.find({}).limit(5);

        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const to = now;

        const doc = {
            label: `${now.toLocaleString("en", { month: "short" })} ${now.getFullYear()}`,
            granularity: "monthly",
            period: { from, to },
            totalSales: 100000,
            ordersCount: 200,
            customersCount: 50,
            productsCount: 500,
            salesByMonth: { labels: ["Oct", "Nov", "Dec"], values: [25000, 35000, 40000] },
            ordersByStatus: [
                { label: "Delivered", value: 120 },
                { label: "Processing", value: 50 },
                { label: "Cancelled", value: 30 },
            ],
            paymentBreakdown: [
                { label: "COD", value: 100 },
                { label: "Easypaisa", value: 50 },
                { label: "Online Banking", value: 50 },
            ],
            topProducts: products.map(p => ({
                product: p._id,
                productName: p.name,
                category: p.category,
                unitsSold: Math.floor(Math.random() * 50) + 10,
                revenue: p.price * (Math.floor(Math.random() * 50) + 10),
            })),
        };

        const count = await AnalyticsSnapshot.countDocuments();
        if (count === 0) {
            const created = await AnalyticsSnapshot.create(doc);
            console.log(`✅ Seeded 1 analytics snapshot ${created._id}.`);
        } else {
            console.log(`ℹ️ Analytics snapshots already exist (count=${count}). Skipping.`);
        }
    } catch (err) {
        console.error("❌ Analytics seeding failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
