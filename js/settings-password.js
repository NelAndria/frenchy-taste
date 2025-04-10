import CONFIG from "./config.js";

    const form = document.getElementById("change-password-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("current-password").value.trim();
      const newPassword = document.getElementById("new-password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();

      if (newPassword !== confirmPassword) {
        document.getElementById("password-message").innerText = "New passwords do not match.";
        return;
      }

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile/password`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Password update failed");
        }

        const result = await response.json();
        document.getElementById("password-message").innerText = result.message;
      } catch (error) {
        document.getElementById("password-message").innerText = error.message;
      }
    });