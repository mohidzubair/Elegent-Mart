// backend/routes/orderRoutes.js
import express from "express";
import OrderCjs from "../models/Order.js";
const Order = OrderCjs.default || OrderCjs;

const router = express.Router();

// GET /api/orders?status=Pending&search=1023
router.get("/", async (req, res) => {
    try {
        const { status, search, limit = 50 } = req.query;
        const query = {};
        if (status && status !== "All") query.orderStatus = status;
        if (search) {
            // search across order _id string or item names
            const regex = new RegExp(search, "i");
            query.$or = [
                { _id: search },
                { "orderItems.name": regex },
            ];
        }
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate({ path: "user", select: "name email" });
        res.json({ count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({ path: "user", select: "name email phone" })
            .populate({ path: "orderItems.product", select: "name price image" });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/orders/:id/status { orderStatus: "Pending"|"Processing"|"Shipped"|"Delivered"|"Cancelled" }
router.put("/:id/status", async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!allowed.includes(orderStatus)) return res.status(400).json({ message: "Invalid status" });
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Order not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
