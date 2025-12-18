// backend/routes/analyticsRoutes.js
import express from "express";
import SnapshotCjs from "../models/AnalyticsSnapshot.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const AnalyticsSnapshot = SnapshotCjs.default || SnapshotCjs;

const router = express.Router();

// GET /api/analytics/stats -> real-time dashboard stats
router.get("/stats", async (_req, res) => {
    try {
        // Get total sales from orders
        const orders = await Order.find({});
        const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Get counts
        const ordersCount = await Order.countDocuments();

        // Count customers from both Customer collection and User collection with role='customer'
        const customerCollectionCount = await Customer.countDocuments();
        const userCustomersCount = await User.countDocuments({ role: 'customer' });
        const customersCount = Math.max(customerCollectionCount, userCustomersCount);

        const productsCount = await Product.countDocuments();

        const stats = {
            totalSales,
            ordersCount,
            customersCount,
            productsCount
        };

        console.log('Stats requested:', stats);
        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/analytics -> latest snapshot or an empty structure
router.get("/", async (_req, res) => {
    try {
        let snap = await AnalyticsSnapshot.findOne({}).sort({ createdAt: -1 });
        if (!snap) {
            snap = {
                label: "N/A",
                granularity: "monthly",
                totalSales: 0,
                ordersCount: 0,
                customersCount: 0,
                productsCount: 0,
                salesByMonth: { labels: [], values: [] },
                ordersByStatus: [],
                paymentBreakdown: [],
                topProducts: [],
            };
            return res.json({ snapshot: snap, empty: true });
        }
        res.json({ snapshot: snap, empty: false });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
