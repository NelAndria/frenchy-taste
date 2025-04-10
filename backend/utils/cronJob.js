import cron from "node-cron";
import { getRandomRecipe } from "../services/spoonacularService.js";
import Recipe from "../models/Recipe.js";

const MAX_RECIPES_PER_DAY = 20;
let recipesGeneratedToday = 0;

// Réinitialiser le compteur à minuit chaque jour
cron.schedule("0 0 * * *", () => {
  console.log("🔄 Réinitialisation du compteur de recettes générées");
  recipesGeneratedToday = 0;
});

// Planifier la tâche pour générer une recette toutes les 20 minutes
cron.schedule("*/20 * * * *", async () => {
  console.log("⏳ Tentative de génération d'une nouvelle recette française...");

  try {
    if (recipesGeneratedToday >= MAX_RECIPES_PER_DAY) {
      console.log("🚫 Limite quotidienne atteinte, génération annulée");
      return;
    }

    // Générer une nouvelle recette française via Spoonacular
    const newRecipeData = await getRandomRecipe();

    // Vérifier si une recette avec le même titre existe déjà
    const existingRecipe = await Recipe.findOne({
      title: new RegExp(`^${newRecipeData.title.trim()}$`, "i"),
    });

    if (existingRecipe) {
      console.log("⚠️ Recette déjà existante :", existingRecipe.title);
      return;
    }

    // Enregistrer la recette en base de données
    const newRecipe = new Recipe(newRecipeData);
    await newRecipe.save();

    recipesGeneratedToday++;
    console.log("✅ Nouvelle recette française sauvegardée :", newRecipe.title);
  } catch (error) {
    console.error("❌ Erreur lors de la génération de recette :", error);
  }
});
