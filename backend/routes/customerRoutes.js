// backend/routes/customerRoutes.js
import express from "express";
import UserCjs from "../models/User.js";
const User = UserCjs.default || UserCjs; // interop for CJS model

const router = express.Router();

// GET /api/customers?status=Active&search=ali
router.get("/", async (req, res) => {
    try {
        const { status, search, limit = 50 } = req.query;
        const query = {};
        if (status && status !== "All") query.status = status;
        if (search) {
            const regex = new RegExp(search, "i");
            query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }
        const customers = await User.find(query)
            .select("name email phone status createdAt role totalPurchases")
            .limit(Number(limit));
        res.json({ count: customers.length, data: customers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-__v");
        if (!user) return res.status(404).json({ message: "Customer not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/customers/:id/status { status: "Active" | "Blocked" | "Pending" }
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["Active", "Blocked", "Pending"];
        if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select("name email phone status");
        if (!updated) return res.status(404).json({ message: "Customer not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
