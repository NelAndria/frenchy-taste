import CONFIG from "./config.js";

async function fetchFeaturedRecipes() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/recipes`);
    const recipes = await response.json();

    const featuredContainer = document.querySelector(".featured-recipes");
    featuredContainer.innerHTML = "<h2>Featured Recipes</h2>";

    // Sélectionner les 4 premières recettes pour l'accueil
    const featuredRecipes = recipes.slice(0, 4);
    
    featuredRecipes.forEach(recipe => {
      const recipeCard = `
        <div class="recipe-card" role="article" aria-label="Recipe: ${recipe.title}">
          <img src="${CONFIG.API_BASE_URL}${recipe.image}" alt="${recipe.title}" />
          <h3>${recipe.title}</h3>
          <a href="recipe.html?id=${recipe._id}" aria-label="View details for ${recipe.title}">See Recipe</a>
        </div>
      `;
      featuredContainer.innerHTML += recipeCard;
    });
  } catch (error) {
    console.error("Error fetching featured recipes:", error);
  }
}

fetchFeaturedRecipes();
