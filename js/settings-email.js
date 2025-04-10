import CONFIG from "./config.js";

const form = document.getElementById("change-email-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const newEmail = document.getElementById("new-email").value.trim();
  const confirmEmail = document.getElementById("confirm-email").value.trim();

  if (newEmail !== confirmEmail) {
    document.getElementById("email-message").innerText = "Emails do not match.";
    return;
  }

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile/email`, {
      method: "PUT",
      credentials: "include",  // Envoie les cookies avec la requête
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ newEmail })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Email update failed");
    }
    
    const result = await response.json();
    document.getElementById("email-message").innerText = result.message;
  } catch (error) {
    document.getElementById("email-message").innerText = error.message;
  }
});

