import CONFIG from "./config.js";

document.getElementById("register-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password, phone })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();
    console.log("Registration successful:", data);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error during registration:", error);
    document.getElementById("error").innerHTML = `<p class="error-message">${error.message}</p>`;
  }
});
