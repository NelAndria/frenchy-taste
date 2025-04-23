// backend/routes/authRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware pour valider les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Endpoint pour l'inscription
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").optional().isMobilePhone().withMessage("Please enter a valid phone number"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, email, password, phone } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword, phone });
      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  }
);

// Endpoint pour la connexion avec validation renforcée
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Générer le token et le refresh token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
      // Définir les cookies sans option "domain"
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000, // 1 heure
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure:false,
        sameSite: "lax",
        maxAge: 7 * 24 * 3600000, // 7 jours
      });
      console.log("Login successful, cookie token set:", res.getHeader("Set-Cookie"));
      res.status(200).json({
        message: "Login successful",
        userId: user._id,
        username: user.username,
      });
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  }
);


// Endpoint pour rafraîchir le token d'accès
router.post("/refresh", async (req, res, next) => {
  try {
    // Récupérer le refresh token depuis le corps ou depuis les cookies
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      // Générer un nouveau token d'accès
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      // Optionnel : mettre à jour le cookie du token d'accès
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // false en dev
        sameSite: "lax",
        maxAge: 3600000, // 1 heure
      });
      res.status(200).json({ token: newToken });
    });
  } catch (error) {
    next(error);
  }
});


// Route protégée : Récupérer le profil utilisateur
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
