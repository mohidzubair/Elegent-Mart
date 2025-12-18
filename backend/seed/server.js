import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
const morganaise = require('morgan');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
// DB connection

  mongoose.connect(`${process.env.MONGODB_URI}${process.env.MONGODB_DB}`)
  .then(() => console.log("✅MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
