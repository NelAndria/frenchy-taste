
     const contactForm = document.getElementById("contact-form");
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formResponse = document.getElementById("form-response");

      const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        message: document.getElementById("message").value.trim()
      };

      try {
        const response = await fetch("/api/contact", {  // Vous devrez créer ce endpoint côté backend
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send message");
        }
        const result = await response.json();
        formResponse.innerText = result.message;
        contactForm.reset();
      } catch (error) {
        formResponse.innerText = error.message;
      }
    });
  