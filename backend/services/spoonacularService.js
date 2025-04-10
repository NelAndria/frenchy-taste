import axios from "axios";

const SPOONACULAR_API_KEY = "48d5ca4fd89341debc4ce357f5ed85c4"; // Remplace par ta clé API
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes/random";

/**
 * Récupère une recette française bien formatée depuis Spoonacular
 */
export const getRandomRecipe = async () => {
  try {
    const response = await axios.get(SPOONACULAR_URL, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        number: 1, // Une seule recette
        tags: "french" // Filtrer pour des recettes françaises
      },
    });

    const recipe = response.data.recipes[0];

    if (!recipe) throw new Error("Aucune recette trouvée.");

    return {
      title: recipe.title,
      description: recipe.summary.replace(/<\/?[^>]+(>|$)/g, ""), // Supprime le HTML dans le résumé
      image: recipe.image,
      ingredients: recipe.extendedIngredients.map(ing => ing.original), // Liste des ingrédients
      instructions: recipe.analyzedInstructions.length > 0
        ? recipe.analyzedInstructions[0].steps.map(step => step.step) // Étapes numérotées
        : recipe.instructions.split("\n"), // Si pas de format structuré
      category: recipe.dishTypes.join(", ") || "Unknown"
    };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la recette :", error);
    throw error;
  }
};
