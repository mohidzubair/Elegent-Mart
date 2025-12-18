// backend/seedOrders.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

async function run() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGODB_DB || "elegent-mart";
    try {
        await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB for seeding orders...");

        const user = await User.findOne({ role: "customer" });
        if (!user) throw new Error("No customer user found. Seed users first.");
        const products = await Product.find({}).limit(3);
        if (products.length === 0) throw new Error("No products found. Seed products first.");

        const items = products.map(p => ({
            product: p._id,
            name: p.name,
            quantity: 1,
            price: p.price,
            image: p.image,
        }));

        const itemsPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const shippingPrice = 200;
        const taxPrice = 0;
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        const orderDoc = {
            user: user._id,
            orderItems: items,
            shippingAddress: {
                street: "123 Test Street",
                city: user.address?.city || "Karachi",
                state: user.address?.state || "Sindh",
                postalCode: "74000",
                country: "Pakistan",
            },
            paymentMethod: "Cash",
            paymentStatus: "Paid",
            orderStatus: "Processing",
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: true,
            paidAt: new Date(),
        };

        const count = await Order.countDocuments();
        if (count === 0) {
            const created = await Order.create(orderDoc);
            console.log(`✅ Seeded 1 order for user ${user.email}. OrderId=${created._id}`);
        } else {
            console.log(`ℹ️ Orders already exist (count=${count}). Skipping.`);
        }
    } catch (err) {
        console.error("❌ Order seeding failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
