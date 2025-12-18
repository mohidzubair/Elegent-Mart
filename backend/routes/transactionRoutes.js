// backend/routes/transactionRoutes.js
import express from "express";
import TransactionCjs from "../models/Transaction.js";
const Transaction = TransactionCjs.default || TransactionCjs;

const router = express.Router();

// GET /api/transactions?method=Credit%20Card&status=Success&search=TXN
router.get("/", async (req, res) => {
    try {
        const { method, status, search, limit = 50 } = req.query;
        const query = {};
        if (method && method !== "All") query.method = method;
        if (status && status !== "All") query.status = status;
        if (search) {
            const regex = new RegExp(search, "i");
            query.$or = [{ reference: regex }];
        }
        const txns = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate({ path: "user", select: "name phone" })
            .populate({ path: "order", select: "totalPrice orderStatus" });
        res.json({ count: txns.length, data: txns });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/transactions/:id
router.get("/:id", async (req, res) => {
    try {
        const txn = await Transaction.findById(req.params.id)
            .populate({ path: "user", select: "name email phone" })
            .populate({ path: "order", select: "totalPrice itemsPrice paymentMethod" });
        if (!txn) return res.status(404).json({ message: "Transaction not found" });
        res.json(txn);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
