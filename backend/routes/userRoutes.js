import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware pour valider les erreurs
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 📌 Récupérer le profil utilisateur (route protégée)
router.get("/profile", authMiddleware, async (req, res, next) => {
  console.log("User ID extrait du token :", req.user?.id); // Ajout du log

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Token is invalid or expired" });
    }

    const user = await User.findById(req.user.id).select("-password"); // Exclut le mot de passe
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ✏ Mettre à jour le profil utilisateur connecté
router.put(
  "/profile",
  authMiddleware,
  [
    body("username").optional().trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    body("phone").optional().trim().isMobilePhone().withMessage("Invalid phone number"),
    body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be under 500 characters"),
    body("profilePicture").optional().isURL().withMessage("Invalid URL for profile picture"),
  ],
  validate,
  async (req, res, next) => {
    try {
      // Empêcher la modification de champs sensibles
      const { email, password, role, ...updates } = req.body;

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

// 🔒 Modifier le mot de passe
router.put(
  "/profile/password",
  authMiddleware,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Route pour supprimer définitivement son compte
router.delete("/profile", authMiddleware, async (req, res, next) => {
  try {
    // Optionnel : Vérifier le mot de passe envoyé dans le corps de la requête
    if (req.body.password) {
      const user = await User.findById(req.user.id);
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }
    }
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    next(error);
  }
});

// Route pour mettre à jour les préférences de notification
router.put("/notifications", authMiddleware, async (req, res, next) => {
  try {
    const { recipes, security, promotions } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Sauvegarder les préférences (ajoute ces champs dans ton modèle User si nécessaire)
    user.notifications = {
      recipes: recipes === undefined ? user.notifications?.recipes || false : recipes,
      security: security === undefined ? user.notifications?.security || false : security,
      promotions: promotions === undefined ? user.notifications?.promotions || false : promotions
    };
    await user.save();
    res.json({ message: "Notification preferences updated successfully" });
  } catch (error) {
    next(error);
  }
});



export default router;

