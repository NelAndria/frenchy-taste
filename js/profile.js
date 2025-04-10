import CONFIG from "./config.js";

async function fetchUserProfile() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
      method: "GET",
      credentials: "include" // Envoie les cookies avec la requête
    });
    if (!response.ok) throw new Error("Failed to load profile");
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

async function updateUserProfile(e) {
  e.preventDefault();
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
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
    if (!response.ok) throw new Error("Profile Update failed");
    const result = await response.json();
    document.getElementById("message").innerText = result.message;
    fetchUserProfile();
  } catch (error) {
    document.getElementById("message").innerText = error.message;
  }
}

document.getElementById("profile-form").addEventListener("submit", updateUserProfile);
fetchUserProfile();

