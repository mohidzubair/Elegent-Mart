// backend/models/Order.js
// Order entity for OrderManagement with relationships to User and Product

import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        image: { type: String },
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true, default: "Pakistan" },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        orderItems: { type: [orderItemSchema], required: true, default: [] },

        shippingAddress: addressSchema,

        paymentMethod: {
            type: String,
            enum: ["Cash", "COD", "Credit Card", "Debit Card", "Easypaisa", "JazzCash", "Wallet", "Online Banking"],
            default: "Cash",
        },
        paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },

        orderStatus: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },

        itemsPrice: { type: Number, required: true, default: 0 },
        shippingPrice: { type: Number, required: true, default: 0 },
        taxPrice: { type: Number, required: true, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 },

        // Relationship to Transaction (payment record)
        transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },

        // Audit fields
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

const order =  mongoose.model("Order", orderSchema);

export default order;