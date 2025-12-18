import express from "express";
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    logout,
    profile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", profile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

export default router;
