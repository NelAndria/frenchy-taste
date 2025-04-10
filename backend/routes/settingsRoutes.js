// backend/routes/settingsRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// -----------------------------
// Mettre à jour l'adresse e-mail
// -----------------------------
router.put("/email", authMiddleware, [
  body("newEmail").isEmail().withMessage("Please enter a valid email"),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { newEmail } = req.body;
    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    // Mettre à jour l'email de l'utilisateur connecté
    const user = await User.findByIdAndUpdate(req.user.id, { email: newEmail }, { new: true }).select("-password");
    res.json({ message: "Email updated successfully", user });
  } catch (error) {
    next(error);
  }
});

// -----------------------------
// Mettre à jour le mot de passe
// -----------------------------
router.put("/password", authMiddleware, [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Vérifier que le mot de passe actuel est correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    // Hasher le nouveau mot de passe et le sauvegarder
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
