// backend/routes/recipeRoutes.js
import express from "express";
import { body, query, param, validationResult } from "express-validator";
import Recipe from "../models/Recipe.js";
//import generateRecipe from "../utils/generateRecipe.js";
import redisClient from "../config/redisClient.js";
import authMiddleware from "../middleware/authMiddleware.js";
//import { getRandomRecipe } from "../services/spoonacularService.js";

const router = express.Router();

// Middleware de validation des erreurs
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Fonction pour effacer le cache des recherches
const clearCache = async () => {
  const keys = await redisClient.keys("search:fulltext:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
    console.log("🧹 Cache Redis nettoyé");
  }
};

// 🔍 Recherche par mots-clés avec validation et cache
router.get(
  "/search",
  [
    query("query").notEmpty().withMessage("Query parameter is required"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const queryStr = req.query.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const cacheKey = `search:fulltext:${queryStr}:${page}:${limit}`;

      // Vérifier le cache
      const cachedResults = await redisClient.get(cacheKey);
      if (cachedResults) {
        console.log("🔄 Résultats récupérés depuis le cache");
        return res.json(JSON.parse(cachedResults));
      }

      // Recherche dans MongoDB
      const recipes = await Recipe.find(
        { $text: { $search: queryStr } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit);

      // Stocker en cache pendant 10 minutes
      if (recipes.length > 0) {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(recipes));
      }

      res.json(recipes);
    } catch (error) {
      next(error);
    }
  }
);

// 🔀 Route GET pour récupérer une recette aléatoire via Spoonacular
router.get("/random", async (req, res, next) => {
  try {
    const recipe = await getRandomRecipe();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la recette." });
  }
});

// ⚡ Route POST pour générer une recette via Spoonacular (protégée par auth)
// Cette route utilise la fonction generateRecipe pour récupérer une recette externe,
// vérifie l'existence d'un doublon et la sauvegarde dans la base de données
/*router.post("/generate", authMiddleware, async (req, res, next) => {
  try {
    // Générer la recette via l'API externe
    const newRecipeData = await generateRecipe();

    // Vérifier si une recette avec le même titre existe déjà (éviter les doublons)
    const existingRecipe = await Recipe.findOne({
      title: new RegExp(`^${newRecipeData.title.trim()}$`, "i"),
    });

    if (existingRecipe) {
      console.log("⚠ Recette déjà existante :", existingRecipe.title);
      return res.status(200).json(existingRecipe);
    }

    // Créer une instance du modèle Recipe et la sauvegarder dans la base
    const newRecipe = new Recipe(newRecipeData);
    await newRecipe.save();

    // Effacer le cache des recherches pour que la nouvelle recette soit prise en compte
    await clearCache();

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error generating and saving recipe:", error);
    next(error);
  }
});*/

// 📜 Récupérer toutes les recettes
router.get("/", async (req, res, next) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

// 🆔 Récupérer une recette par ID avec validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid recipe ID")],
  validate,
  async (req, res, next) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (err) {
      console.error("Error fetching recipe by ID:", err);
      next(err);
    }
  }
);

// ➕ Ajouter une nouvelle recette (protégée par auth)
router.post(
  "/",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("ingredients").isArray({ min: 1 }).withMessage("At least one ingredient is required"),
    body("instructions").notEmpty().withMessage("Instructions are required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const newRecipe = new Recipe(req.body);
      const savedRecipe = await newRecipe.save();
      await clearCache();
      res.status(201).json(savedRecipe);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

