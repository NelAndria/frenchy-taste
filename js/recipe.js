import CONFIG from "./config.js";

let currentPage = 1;
const limitPerPage = 10;

// Récupérer l'ID de la recette depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id'); 
console.log("Extracted recipe ID:", recipeId);

if (!recipeId) {
  document.getElementById("recipe-container").innerHTML = "<p>Recipe not found.</p>";
} else {
  fetchRecipe(recipeId);
  fetchReviews();
  fetchReviewStats();
  renderReviewForm(); // affiche le formulaire d'avis ou le message de login
}

// === 2. Gestion des recettes ===

// Récupérer les détails de la recette depuis l'API
async function fetchRecipe(id) {
  try {
    console.log("Fetching recipe with ID:", id);
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/recipes/${id}`);
    
    if (!response.ok) throw new Error("Recipe not found");

    const recipe = await response.json();
    console.log("Recipe data received:", recipe);
    displayRecipe(recipe);
  } catch (error) {
    document.getElementById("recipe-container").innerHTML = `
      <div class="error-message" role="alert">
        <h2>Oops! Recipe not found.</h2>
        <p>The recipe you are looking for does not exist or has been removed.</p>
        <button onclick="goBack()" aria-label="Go back to recipes" class="back-button">← Back to Recipes</button>
      </div>
    `;
  }
}

// Afficher la recette dans le DOM
function displayRecipe(recipe) {
  const container = document.getElementById("recipe-container");

  const recipeImage = recipe.image && recipe.image.startsWith('http') 
    ? recipe.image 
    : `${CONFIG.API_BASE_URL}${recipe.image}`;

  container.innerHTML = `
    <div class="recipe-details" role="article" aria-label="Recipe details for ${recipe.title}">
      <h2>${recipe.title}</h2>
      <img src="${recipeImage}" alt="${recipe.title}" onerror="this.onerror=null; this.src='fallback.jpg';"/>
      <div class="recipe-info">
        <p><strong>Category:</strong> ${recipe.category}</p>
        <h3>Ingredients</h3>
        <ul class="ingredient-list">
          ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join("")}
        </ul>
        <h3>Instructions:</h3>
        <ol class="instruction-list">
          ${Array.isArray(recipe.instructions) 
            ? recipe.instructions.map(instruction => `<li>${instruction}.</li>`).join("") 
            : `<li>${recipe.instructions}</li>`}
        </ol>
      </div>
      <button onclick="goBack()" aria-label="Go back to recipes" class="back-button">← Back to Recipes</button>
    </div>
  `;
}

// Retour en arrière
function goBack() {
  window.history.back();
}
window.goBack = goBack;

// === 3. Gestion des avis ===

// Récupérer et afficher les avis avec tri et filtre
async function fetchReviews(loadMore = false) {
  try {
    const sort = document.getElementById("sort").value;
    const minRating = document.getElementById("minRating").value;
    const userId = localStorage.getItem("userId"); 

    const url = `${CONFIG.API_BASE_URL}/api/reviews/${recipeId}?sort=${sort}&minRating=${minRating}&page=${currentPage}&limit=${limitPerPage}`;
    console.log("Fetching reviews from:", url);

    const response = await fetch(url);
    const data = await response.json();
    const { reviews, hasMore } = data;

    displayReviews(reviews, userId, loadMore);
    // Gestion du bouton load more
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (hasMore) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
}

// Afficher les avis dans le DOM
function displayReviews(reviews, userId, loadMore) {
  const reviewsList = document.getElementById("reviews-list");

  // Si ce n'est pas un chargement progressif, recharger la liste
  if (!loadMore) {
    reviewsList.innerHTML = "";
  }

  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem("token");
   
  reviews.forEach(review => {
    const showActionButtons = token ? true : false;
    const isOwner = review.user && (review.user._id.toString() === userId);

    reviewsList.innerHTML += `
      <div class="review" role="listitem" aria-label="Review by ${review.user?.username || "Unknown User"}">
        <p><strong>${review.user?.username || "Unknown User"}</strong> rated it ${displayStars(review.rating)}</p>
        <p>${review.comment}</p>
        <p><em>${new Date(review.createdAt).toLocaleString()}</em></p>
        <p>Useful: ${review.usefulCount || 0}</p>
        ${
          showActionButtons
          ? `<button onclick="upvoteReview('${review._id}')" aria-label="Upvote review">👍</button>
             <button onclick="downvoteReview('${review._id}')" aria-label="Downvote review">👎</button>`
          : `<small>Please login to vote</small>`
        }
        ${
          isOwner && showActionButtons 
          ? `<button onclick="editReview('${review._id}', '${review.rating}', '${review.comment.replace(/'/g, "\\'")}')" aria-label="Edit review">Edit</button>
             <button onclick="deleteReview('${review._id}')" aria-label="Delete review">Delete</button>`
          : ""
        }
      </div>
    `;
  });
}

document.getElementById("loadMoreBtn")?.addEventListener("click", () => {
  currentPage++;
  fetchReviews(true);
});

// Charger et afficher les statistiques des avis
async function fetchReviewStats() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/reviews/stats/${recipeId}`);
    const stats = await response.json();
    const statsDiv = document.getElementById("review-stats");
    
    statsDiv.innerHTML = `
      <p>${displayStars(stats.averageRating || 0)} (${(stats.averageRating || 0).toFixed(1)}/5 based on ${stats.count || 0} reviews)</p>
    `;
  } catch (error) {
    console.error("Error fetching review stats:", error);
  }
}

// === 4. Ajout, modification et suppression des avis ===

function renderReviewForm() {
  const token = localStorage.getItem("token");
  const reviewFormContainer = document.getElementById("review-form-container");

  if (!token) {
    reviewFormContainer.innerHTML = `
      <p>Please <a href="login.html">login</a> to post or modify reviews.</p>
    `;
  } else {
    reviewFormContainer.innerHTML = `
      <h4>Leave a Review</h4>
      <form id="review-form" aria-label="Leave a review form">
        <!-- Système d'étoiles pour la note --> 
        <div id="star-rating" role="radiogroup" aria-label="Star rating">\n
          <i class="fa-regular fa-star" data-value="1" tabindex="0" role="radio" aria-checked="false"></i>\n
          <i class="fa-regular fa-star" data-value="2" tabindex="0" role="radio" aria-checked="false"></i>\n
          <i class="fa-regular fa-star" data-value="3" tabindex="0" role="radio" aria-checked="false"></i>\n
          <i class="fa-regular fa-star" data-value="4" tabindex="0" role="radio" aria-checked="false"></i>\n
          <i class="fa-regular fa-star" data-value="5" tabindex="0" role="radio" aria-checked="false"></i>\n
        </div>\n
        <!-- Champ caché pour stocker la note sélectionnée -->\n
        <input type="hidden" id="rating" name="rating" required>\n
        
        <label for="comment">Comment:</label>\n
        <textarea id="comment" name="comment" placeholder="Enter your review here..." aria-label="Your review" required></textarea>\n
        <button type="submit" aria-label="Submit review">Submit Review</button>\n
      </form>\n
      <div id="message" role="alert"></div>\n
    `;
    setupStarRating();
    setupReviewForm();
  }
}

function setupStarRating() {
  const stars = document.querySelectorAll("#star-rating i");
  stars.forEach(star => {
    star.addEventListener("click", function() {
      const ratingValue = this.getAttribute("data-value");
      document.getElementById("rating").value = ratingValue;
      // Mettre à jour l'affichage des étoiles et leur état ARIA\n
      stars.forEach(s => {
        if (s.getAttribute("data-value") <= ratingValue) {
          s.classList.remove("fa-regular");
          s.classList.add("fa-solid", "active");
          s.setAttribute("aria-checked", "true");
        } else {
          s.classList.remove("fa-solid", "active");
          s.classList.add("fa-regular");
          s.setAttribute("aria-checked", "false");
        }
      });
    });
  });
}

function setupReviewForm() {
  document.getElementById("review-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to post a review");
        return;
      }
      const rating = document.getElementById("rating").value;
      const comment = document.getElementById("comment").value;
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ recipe: recipeId, rating, comment })
      });
      if (!response.ok) throw new Error("Failed to post review");

      // Recharger les avis et les statistiques
      fetchReviews();
      fetchReviewStats();
      document.getElementById("review-form").reset();
      // Réinitialiser le système d'étoiles\n
      document.querySelectorAll("#star-rating i").forEach(star => {
        star.classList.remove("fa-solid", "active");
        star.classList.add("fa-regular");
        star.setAttribute("aria-checked", "false");
      });
      // Afficher un message de confirmation
      const message = document.getElementById("message");
      message.innerText = "Your review has been posted successfully!";
      message.style.display = "block";
      setTimeout(() => { message.style.display = "none"; }, 3000);
    } catch (error) {
      console.error("Error posting review:", error);
    }
  });
}

// Modifier un avis
function editReview(reviewId, currentRating, currentComment) {
  const newRating = prompt("Enter new rating (1-5):", currentRating);
  const newComment = prompt("Enter new comment:", currentComment);
  if (newRating && newComment) {
    updateReview(reviewId, newRating, newComment);
  }
}

async function updateReview(reviewId, rating, comment) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to edit a review");
      return;
    }
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment })
    });
    if (!response.ok) throw new Error("Failed to update review");

    alert("Review updated successfully");
    fetchReviews();
  } catch (error) {
    console.error("Error updating review:", error);
  }
}

// Supprimer un avis
async function deleteReview(reviewId) {
  if (!confirm("Are you sure you want to delete this review?")) return;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete a review");
      return;
    }
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to delete review");

    alert("Review deleted successfully");
    fetchReviews();
  } catch (error) {
    console.error("Error deleting review:", error);
  }
}

// Gestion des étoiles : retourne une chaîne d'étoiles
function displayStars(rating) {
  const roundedRating = Math.round(rating);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += (i <= roundedRating) ? "⭐" : "☆";
  }
  return stars;
}

// Gestion des événements utilisateur (tri, filtre, etc.)
document.getElementById("sort").addEventListener("change", fetchReviews);
document.getElementById("minRating").addEventListener("change", fetchReviews);
document.getElementById("filter-button")?.addEventListener("click", fetchReviews);
