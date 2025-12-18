// backend/models/Notification.js
// Notification entity for Notifications page; supports broadcast and targeted messages
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },

        audience: {
            type: String,
            enum: ["All Customers", "Active Customers", "Inactive Customers", "Specific User"],
            default: "All Customers",
        },

        targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // used when audience === "Specific User"

        channel: { type: String, enum: ["app", "email", "sms"], default: "app" },
        status: { type: String, enum: ["Draft", "Queued", "Sent", "Failed"], default: "Sent" },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin user
        sentAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

notificationSchema.index({ audience: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });

const notification = mongoose.model("Notification", notificationSchema);

export default notification;