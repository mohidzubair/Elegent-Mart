// backend/models/User.js
// Core user model covering customers and admins. Drives CustomerManagement and cross-entity relations.
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    phone: { type: String, trim: true },

    // Minimal auth surface (password can be added later in an auth story)
    // password: { type: String, select: false },
    password: { type: String, required: true, select: false },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    status: { type: String, enum: ["Active", "Blocked", "Pending"], default: "Active" },

    address: addressSchema,

    // Useful KPIs for Admin views
    totalPurchases: { type: Number, default: 0 }, // total amount spent
    lastLogin: { type: Date },

    // Wishlist and cart capture relationships to products
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

// Virtual: orders placed by this user
userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

// For CustomerManagement's "joined" column convenience
userSchema.virtual("joined").get(function () {
  return this.createdAt;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Mongoose creates a unique index from the `unique: true` on email above
userSchema.index({ role: 1, status: 1 });

// Hash password before saving
// Use promise-style middleware (no next) to avoid "next is not a function" when Mongoose calls hooks
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;