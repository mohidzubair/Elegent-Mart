// backend/routes/notificationRoutes.js
import express from "express";
import NotificationCjs from "../models/Notification.js";
const Notification = NotificationCjs.default || NotificationCjs;

const router = express.Router();

// GET /api/notifications
router.get("/", async (_req, res) => {
    try {
        const list = await Notification.find({}).sort({ createdAt: -1 }).limit(100);
        res.json({ count: list.length, data: list });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/notifications
router.post("/", async (req, res) => {
    try {
        const created = await Notification.create(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Notification not found" });
        res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
