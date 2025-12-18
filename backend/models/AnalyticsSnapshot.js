// backend/models/AnalyticsSnapshot.js
// Optional snapshot/cached analytics to power AnalyticsReports (KPI tiles & charts)
import mongoose from "mongoose";

const numberSeriesSchema = new mongoose.Schema(
    {
        labels: { type: [String], default: [] },
        values: { type: [Number], default: [] },
    },
    { _id: false }
);

const distSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        value: { type: Number, required: true },
    },
    { _id: false }
);

const topProductSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String },
        category: { type: String },
        unitsSold: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
    },
    { _id: false }
);

const analyticsSnapshotSchema = new mongoose.Schema(
    {
        label: { type: String, trim: true }, // e.g., "Aug 2025", "Q3 2025", "Week 34"
        granularity: { type: String, enum: ["daily", "weekly", "monthly", "custom"], default: "monthly" },
        period: {
            from: { type: Date },
            to: { type: Date },
        },

        // KPI tiles
        totalSales: { type: Number, default: 0 },
        ordersCount: { type: Number, default: 0 },
        customersCount: { type: Number, default: 0 },
        productsCount: { type: Number, default: 0 },

        // Charts
        salesByMonth: numberSeriesSchema, // for line chart
        ordersByStatus: { type: [distSchema], default: [] }, // for pie
        paymentBreakdown: { type: [distSchema], default: [] }, // for doughnut

        // Tables
        topProducts: { type: [topProductSchema], default: [] },

        // Audit
        computedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

analyticsSnapshotSchema.index({ granularity: 1, "period.from": 1, "period.to": 1 });

const analyticsSnapshot = mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema);

export default analyticsSnapshot;