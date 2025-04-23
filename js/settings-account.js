import CONFIG from "./config.js";

async function loadAccountInfo() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
      method: "GET",
      credentials: "include"
    });
    if (!response.ok) throw new Error("Impossible de charger les informations du compte");
    const user = await response.json();
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("profilePicture").value = user.profilePicture || "";
    document.getElementById("bio").value = user.bio || "";
  } catch (error) {
    document.getElementById("account-message").innerText = error.message;
  }
}

async function updateAccountInfo(e) {
  e.preventDefault();
  try {
    const data = {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      profilePicture: document.getElementById("profilePicture").value,
      bio: document.getElementById("bio").value
    };
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Échec de la mise à jour");
    const result = await response.json();
    document.getElementById("account-message").innerText = result.message;
    // Recharge les infos pour rafraîchir le formulaire
    loadAccountInfo();
  } catch (error) {
    document.getElementById("account-message").innerText = error.message;
  }
}

document.getElementById("account-form").addEventListener("submit", updateAccountInfo);
loadAccountInfo();
