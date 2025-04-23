import CONFIG from "./config.js";

async function deleteAccount(e) {
  e.preventDefault();
  const password = document.getElementById("confirmPassword").value;
  // Optionnel : Demander une confirmation supplémentaire via window.confirm()
  if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) {
    return;
  }
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password }) // Si tu veux vérifier le mot de passe
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Compte non supprimé");
    }
    const result = await response.json();
    document.getElementById("delete-message").innerText = result.message;
    // Optionnel : rediriger l'utilisateur après suppression
    setTimeout(() => window.location.href = "login.html", 3000);
  } catch (error) {
    document.getElementById("delete-message").innerText = error.message;
  }
}

document.getElementById("delete-account-form").addEventListener("submit", deleteAccount);
