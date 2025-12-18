// backend/models/Transaction.js
// Transaction entity for Payments & Transactions page; links Orders and Users
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "PKR" },

        method: {
            type: String,
            enum: ["Cash", "COD", "Credit Card", "Easypaisa", "JazzCash", "Wallet", "Online Banking"],
            required: true,
        },
        status: { type: String, enum: ["Success", "Pending", "Failed", "Refunded"], default: "Pending" },

        reference: { type: String, trim: true }, // PSP reference, wallet txn id
        meta: { type: Object }, // gateway raw payload if needed

        processedAt: { type: Date },
    },
    { timestamps: true }
);

transactionSchema.index({ method: 1, status: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });

const transaction =  mongoose.model("Transaction", transactionSchema);

export default transaction;