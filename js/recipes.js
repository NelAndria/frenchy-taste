import CONFIG from "./config.js";

// Fonction pour déterminer les catégories d'une recette
function determineCategories(recipe) {
  let categories = [];

  if (!recipe.category || recipe.category.trim() === "") {
    const title = recipe.title.toLowerCase();

    const starterKeywords = ["starter", "appetizer", "entrée", "salad", "soup"];
    const mainCourseKeywords = ["main", "main course", "plat", "entree", "meat", "fish"];
    const dessertKeywords = ["dessert", "sweet", "pastry", "cake", "chocolate"];

    if (starterKeywords.some(keyword => title.includes(keyword))) categories.push("Starter");
    if (mainCourseKeywords.some(keyword => title.includes(keyword))) categories.push("Main");
    if (dessertKeywords.some(keyword => title.includes(keyword))) categories.push("Dessert");

    if (categories.length === 0) categories.push("Main"); // Par défaut
  } else {
    const categoryLowerCase = Array.isArray(recipe.category)
      ? recipe.category.map(cat => cat.toLowerCase())
      : [recipe.category.toLowerCase()];

    if (categoryLowerCase.some(cat => cat.includes("main"))) categories.push("Main");
    if (categoryLowerCase.some(cat => cat.includes("starter") || cat.includes("appetizer"))) categories.push("Starter");
    if (categoryLowerCase.some(cat => cat.includes("dessert"))) categories.push("Dessert");
  }

  return categories;
}

async function fetchRecipes() {
  console.log("🔍 fetchRecipes() est appelé !");
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/recipes`);
    console.log("Réponse reçue :", response);

    const recipes = await response.json();
    console.log("Recettes récupérées :", recipes);

    const recipesContainer = document.querySelector(".recipes-container");
    recipesContainer.innerHTML = ""; // Effacer le contenu existant

    recipes.forEach(recipe => {
      console.log("Recipe Image URL:", recipe.image);
      const recipeImage = recipe.image && recipe.image.startsWith('http')
        ? recipe.image
        : `${CONFIG.API_BASE_URL}${recipe.image}`;

      const categories = determineCategories(recipe);
      const categoryClass = categories.join(" ");

      const recipeCard = `
        <div class="recipe-card" data-category="${categoryClass}" role="article" aria-label="Recipe: ${recipe.title}">
          <img src="${recipeImage}" alt="${recipe.title}" onerror="this.onerror=null; this.src='fallback.jpg';"/>
          <h3>${recipe.title}</h3>
          <p>${recipe.description}</p>
          <a href="recipe.html?id=${recipe._id}" aria-label="View recipe details for ${recipe.title}">View Recipe</a>
        </div>
      `;
      recipesContainer.innerHTML += recipeCard;
    });

    setupFiltering();
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

function setupFiltering() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const recipesContainer = document.querySelector(".recipes-container");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category");
      const recipeCards = recipesContainer.querySelectorAll(".recipe-card");

      recipeCards.forEach(card => {
        const cardCategories = card.getAttribute("data-category").split(" ");
        if (category === "all" || cardCategories.includes(category)) {
          card.classList.remove("hide");
        } else {
          card.classList.add("hide");
        }
      });
    });
  });
}

// Gestion de la recherche
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("search") === "1") {
  const results = localStorage.getItem("searchResults");
  if (results) {
    const recipes = JSON.parse(results);
    const container = document.querySelector(".recipes-container");

    container.innerHTML = `
      <div class="search-content">
        <h2 class="search-title">Search Results</h2>
        <div class="search-results"></div>
      </div>
    `;

    const resultsContainer = container.querySelector(".search-results");

    recipes.forEach(recipe => {
      console.log("Recipe Image URL:", recipe.image);

      const category = determineCategories(recipe).join(" ");
      const recipeImage = recipe.image && recipe.image.startsWith('http')
        ? recipe.image
        : `${CONFIG.API_BASE_URL}${recipe.image}`;

      resultsContainer.innerHTML += `
        <div class="recipe-card" data-category="${category}" role="article" aria-label="Recipe: ${recipe.title}">
          <img src="${recipeImage}" alt="${recipe.title}" onerror="this.onerror=null; this.src='fallback.jpg';"/>
          <h3>${recipe.title}</h3>
          <a href="recipe.html?id=${recipe._id}" aria-label="View recipe details for ${recipe.title}">See Recipe</a>
        </div>
      `;
    });
  }
} else {
  fetchRecipes();
}

export { fetchRecipes, setupFiltering, determineCategories };
