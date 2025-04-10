// generateRecipe.js
import fetch from "node-fetch"; // Assure-toi d'avoir installé node-fetch
import Recipe from "../models/Recipe.js";  // N'oublie pas d'ajouter l'extension .js dans l'import
import dotenv from "dotenv";
dotenv.config();

async function generateUniqueRecipe() {
    try {
        let newRecipe = null;
        let attempts = 0; // Sécuriser contre une boucle infinie

        while (!newRecipe && attempts < 30) { // Limite à 10 tentatives pour éviter un blocage
            attempts++;

            // 1. Récupérer la liste des recettes françaises
            const listResponse = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=French");
            if (!listResponse.ok) throw new Error("Error fetching French recipes list from TheMealDB");

            const listData = await listResponse.json();
            if (!listData.meals || listData.meals.length === 0) throw new Error("No French recipes found");

            // 2. Choisir aléatoirement une recette
            const randomIndex = Math.floor(Math.random() * listData.meals.length);
            const randomMeal = listData.meals[randomIndex];
            const mealId = randomMeal.idMeal;

            // 3. Récupérer les détails de la recette
            const detailsResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            if (!detailsResponse.ok) throw new Error("Error fetching recipe details from TheMealDB");

            const detailsData = await detailsResponse.json();
            if (!detailsData.meals || detailsData.meals.length === 0) throw new Error("No recipe details found");

            const meal = detailsData.meals[0];

            // 4. Normaliser les données pour éviter les doublons
            const normalizedTitle = meal.strMeal.trim().toLowerCase();

            // Vérifier si la recette existe déjà **de manière stricte**
            const existingRecipe = await Recipe.findOne({ title: new RegExp(`^${normalizedTitle}$`, "i") });

            if (!existingRecipe) {
                // 5. Construire l'objet recette
                const recipeData = {
                    title: meal.strMeal.trim(),
                    description: meal.strTags || "",
                    category: meal.strCategory,
                    image: meal.strMealThumb,
                    instructions: meal.strInstructions 
                        ? meal.strInstructions.split(/\r?\n/).filter(line => line.trim() !== "")
                        : [],
                    ingredients: []
                };

                // Ajouter les ingrédients
                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    if (ingredient && ingredient.trim() !== "") {
                        recipeData.ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
                    }
                }

                // 6. Enregistrer la nouvelle recette
                newRecipe = new Recipe(recipeData);
                await newRecipe.save();
                console.log("✅ Recette générée et sauvegardée :", newRecipe.title);
            } else {
                console.log("⚠️ Recette déjà existante :", existingRecipe.title, "- Recherche d'une nouvelle recette...");
            }
        }

        if (!newRecipe) {
            console.log("❌ Aucune recette unique trouvée après 10 tentatives");
            throw new Error("No unique recipe found after 10 attempts");
        }

        return newRecipe;
    } catch (error) {
        console.error("❌ Erreur lors de la génération de la recette :", error);
        throw error;
    }
}

export default generateUniqueRecipe;
