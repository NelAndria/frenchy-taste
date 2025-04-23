// backend/server.js
import dotenv from "dotenv";
dotenv.config();

console.log("NODE_ENV:", process.env.NODE_ENV); // Vérifie ici

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import CONFIG from "./config.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = ["http://localhost:5500"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

// Servir les fichiers statiques du dossier public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
mongoose.connect(CONFIG.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

import userRoutes from "./routes/userRoutes.js";
app.use('/api/users', userRoutes);

import authRoutes from "./routes/authRoutes.js";
app.use('/api/auth', authRoutes);

import recipeRoutes from "./routes/recipeRoutes.js";
app.use('/api/recipes', recipeRoutes);

import reviewRoutes from "./routes/reviewRoutes.js";
app.use('/api/reviews', reviewRoutes);

import blogRoutes from "./routes/blogRoutes.js";
app.use('/api/blog', blogRoutes);

import testRoutes from "./routes/test.js";
app.use("/api/test", testRoutes);

import settingsRoutes from "./routes/settingsRoutes.js";
app.use("/api/users/settings", settingsRoutes);

import glossaryRoutes from "./routes/glossaryRoutes.js";
app.use("/api/glossary", glossaryRoutes);

import seasonalProduceRoutes from "./routes/seasonalProduceRoutes.js";
app.use("/api/produce", seasonalProduceRoutes);



app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur :", err);
  res.status(err.status || 500).json({
    message: err.message || "Erreur interne du serveur",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(CONFIG.PORT, () => console.log(`Server running on port ${CONFIG.PORT}`));

//import "./utils/cronJob.js";



