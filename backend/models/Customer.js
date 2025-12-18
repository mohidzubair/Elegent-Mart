// backend/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true }, // e.g., #C101
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  joined: { type: Date, required: true }, // store as Date
  status: { 
    type: String, 
    enum: ["Active", "Blocked"], 
    default: "Active" 
  }
}, { timestamps: true });

const customer = mongoose.model("Customer", customerSchema);

export default customer;