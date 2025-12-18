// backend/models/Product.js (ES Module)
// Product catalog items used by the admin Products page and customer views.

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link to User if available
        comment: { type: String, trim: true },
        rating: { type: Number, min: 0, max: 5 },
        date: { type: Date, default: Date.now },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        image: { type: String, required: true },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        unit: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true },
        allowDecimal: { type: Boolean, default: false },
        quantity_increase: { type: Number, default: 1, min: 1 },
        stock: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage
        brand: { type: String, trim: true },
        expiry_date: { type: Date },
        tags: [{ type: String, trim: true }],
        reviews: [reviewSchema],
        // Derived metrics (optional – can be aggregated instead)
        soldCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

productSchema.index({ name: 1, category: 1 });
productSchema.index({ tags: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
