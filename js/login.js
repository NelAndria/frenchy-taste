import CONFIG from "./config.js";

document.getElementById("login-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password})
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        console.log("Login succesful:", data);

        //stocke le token (par exemple, dans le local storage)
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        //redirige l'utilisateur vers la page d'acceuil ou une page protegée
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error during login:", error);
        document.getElementById("error").innerHTML = `<p> class = "error-message">${error.message}</p>`;
    }
});