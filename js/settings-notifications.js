import CONFIG from "./config.js";

async function updateNotifications(e) {
  e.preventDefault();
  // Récupérer l'état des cases à cocher
  const notifications = {
    recipes: document.getElementById("notif-recipes").checked,
    security: document.getElementById("notif-security").checked,
    promotions: document.getElementById("notif-promotions").checked
  };
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/notifications`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notifications)
    });
    if (!response.ok) throw new Error("Failed to update notifications");
    const result = await response.json();
    document.getElementById("notifications-message").innerText = result.message;
  } catch (error) {
    document.getElementById("notifications-message").innerText = error.message;
  }
}

document.getElementById("notifications-form").addEventListener("submit", updateNotifications);
