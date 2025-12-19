// backend/index.js (ES Module)
// API server entry point using Express & Mongoose.

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

// CORS configuration for cookie-based auth
const allowedOrigins = [
  process.env.FRONTEND_URL, // prod frontend (if set)
  'https://elegent-mart.vercel.app', // Add your Vercel domain
  'https://elegent-mart-git-main-mohidzubairs-projects.vercel.app',
  'https://elegantsuperstore.com',
  'https://www.elegantsuperstore.com', // With www
  'http://elegantsuperstore.com',
  'http://www.elegantsuperstore.com',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    console.log('[CORS] Request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      console.log('[CORS] ✅ Allowing request with no origin');
      return callback(null, true);
    }

    // Allow any localhost during development (covers dynamic vite ports)
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      console.log('[CORS] ✅ Allowing localhost origin');
      return callback(null, true);
    }

    // Allow any vercel.app domain
    if (origin.includes('.vercel.app')) {
      console.log('[CORS] ✅ Allowing Vercel domain');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] ✅ Allowing whitelisted origin');
      return callback(null, true);
    }

    console.log('[CORS] ❌ Rejecting origin:', origin);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true  // Allow cookies
}));

app.use(express.json());
app.use(cookieParser());

// Enhanced connection with retry/backoff and clearer diagnostics
const connectDB = async (retries = 5, delayMs = 2000) => {
  // Prefer Atlas URI if provided, else local IPv4 fallback
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DB || undefined; // optional explicit DB name
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, dbName });
    const target = (() => {
      try {
        // Avoid printing credentials
        const u = new URL(uri.replace("mongodb+srv://", "http://").replace("mongodb://", "http://"));
        return `${u.hostname}${dbName ? "/" + dbName : u.pathname && u.pathname !== "/" ? u.pathname : ""}`;
      } catch { return "[redacted]"; }
    })();
    console.log(`✅ MongoDB connected (${target})`);
  } catch (error) {
    console.error(`❌ MongoDB connection attempt failed (${retries} retries left):`, error.message);
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delayMs));
      return connectDB(retries - 1, delayMs * 1.5); // exponential backoff
    }
    console.error("🚫 Exhausted MongoDB connection retries. Exiting.");
    process.exit(1);
  }
};

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Elegant Mart API running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
});

// Connection event logging (optional deeper diagnostics)
mongoose.connection.on("error", err => {
  console.error("⚠️ Mongoose connection error event:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected. Will attempt reconnect on next operation.");
});
mongoose.connection.on("connected", () => {
  console.log("🔌 Mongoose connected event acknowledged.");
});

export default app;

