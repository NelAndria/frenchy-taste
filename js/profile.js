import CONFIG from "./config.js";

// Fonction pour rafraîchir l'access token en appelant le endpoint /api/auth/refresh
async function refreshAccessToken() {
  try {
    // Appelle le endpoint refresh ; on suppose que le refresh token est envoyé via le cookie
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // Assure-toi d'envoyer les cookies
      headers: {
        "Content-Type": "application/json"
      },
      // Si ton endpoint lit le refresh token dans le corps, tu peux ajouter cela :
      // body: JSON.stringify({ refreshToken: <YOUR_REFRESH_TOKEN> })
      // Toutefois, dans notre configuration, le refresh token est déjà dans le cookie.
    });
    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }
    const data = await response.json();
    console.log("New access token received:", data.token);
    // Optionnel : Si tu stockes le token localement (ceci dépend de ta gestion), mets à jour ici.
    // localStorage.setItem("token", data.token);
    // Dans notre cas, le nouveau cookie est (supposément) défini par le backend.
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

// Fonction pour récupérer le profil utilisateur via GET /api/users/profile
async function fetchUserProfile() {
  try {
    let response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
      method: "GET",
      credentials: "include" // Envoie les cookies avec la requête
    });

    // Si la réponse est 401 (token expiré ou manquant), tenter de rafraîchir le token
    if (response.status === 401) {
      console.warn("Access token expired or invalid. Attempting to refresh...");
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Réessaye la requête après rafraîchissement
        response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
          method: "GET",
          credentials: "include"
        });
      }
    }

    if (!response.ok) {
      throw new Error("Failed to load profile");
    }

    const user = await response.json();
    console.log("User profile", user);
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("bio").value = user.bio || "";
  } catch (error) {
    document.getElementById("profile-container").innerHTML = `<p class="error">${error.message}</p>`;
  }
}

// Fonction pour mettre à jour le profil via PUT /api/users/profile
async function updateUserProfile(e) {
  e.preventDefault();
  try {
    let response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      credentials: "include", // Envoie les cookies avec la requête
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        bio: document.getElementById("bio").value
      })
    });

    // Tenter de rafraîchir le token en cas de 401
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            bio: document.getElementById("bio").value
          })
        });
      }
    }

    if (!response.ok) throw new Error("Profile Update failed");

    const result = await response.json();
    document.getElementById("message").innerText = result.message;
    // Recharger le profil après mise à jour
    fetchUserProfile();
  } catch (error) {
    document.getElementById("message").innerText = error.message;
  }
}

document.getElementById("profile-form").addEventListener("submit", updateUserProfile);

// Charger le profil dès le chargement de la page
fetchUserProfile();

