import CONFIG from "./config.js";

// Gérer le clic du bouton de recherche
document.getElementById("search-btn").addEventListener("click", async () => {
  const query = document.getElementById("recipe-search").value.trim();
  if (!query) return;

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/recipes/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Error fetching search results");

    const recipes = await response.json();
    localStorage.setItem("searchResults", JSON.stringify(recipes));
    window.location.href = "recipes.html?search=1";
  } catch (error) {
    console.error("Search error:", error);
  }
});

// Déclenchement en temps réel avec debouncing
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Fonction pour effectuer la recherche et afficher les suggestions
async function performSearch(query) {
  const spinner = document.getElementById("spinner");
  const suggestionsDiv = document.getElementById("suggestions");

  spinner.style.display = "block";
  suggestionsDiv.innerHTML = "";

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/recipes/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Error fetching search results");

    const recipes = await response.json();

    spinner.style.display = "none";

    if (recipes.length === 0) {
      suggestionsDiv.innerHTML = `<p>No recipes found.</p>`;
      return;
    }

    suggestionsDiv.innerHTML = recipes.map(recipe => `
      <div class="suggestion" tabindex="0" role="option" aria-label="Recipe: ${recipe.title}">
        <a href="recipe.html?id=${recipe._id}">
          <strong>${recipe.title}</strong> - ${recipe.description}
        </a>
      </div>
    `).join("");
  } catch (error) {
    spinner.style.display = "none";
    suggestionsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    console.error("Search error:", error);
  }
}

const searchInput = document.getElementById("recipe-search");
searchInput.addEventListener("input", debounce(function() {
  const query = searchInput.value.trim();
  if (query) {
    performSearch(query);
  } else {
    document.getElementById("suggestions").innerHTML = "";
  }
}, 300));
