// Fonction pour calculer les initiales à partir du nom complet
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const token = localStorage.getItem("token");

if (token) {
  const username = localStorage.getItem("username");
  const initials = getInitials(username);
  const userMenu = document.getElementById("user-menu");

  userMenu.innerHTML = `
    <button id="user-button" aria-haspopup="true" aria-expanded="false" aria-label="User menu">${initials}</button>
    <div id="user-dropdown" role="menu" aria-labelledby="user-button">
      <a href="profile.html" role="menuitem">Profile</a>
      <div class="settings-wrapper">
        <button id="settings-button" aria-haspopup="true" aria-expanded="false" aria-label="Settings submenu">Settings ▸</button>
        <div id="settings-submenu" class="submenu" role="menu">
          <div class="nested-menu">
            <button id="security-button" aria-haspopup="true" aria-expanded="false" aria-label="Security submenu">🔐 Security & Login ▸</button>
            <div id="security-submenu" class="nested-submenu" role="menu">
              <a href="settings-email.html" role="menuitem">Change Email</a>
              <a href="settings-password.html" role="menuitem">Change Password</a>
            </div>
          </div>
          <a href="settings-preferences.html" role="menuitem">🌎 Preferences</a>
          <a href="settings-food.html" role="menuitem">🍽 Food Preferences</a>
          <a href="settings-notifications.html" role="menuitem">📧 Notifications</a>
          <a href="settings-privacy.html" role="menuitem">📝 Privacy & Account</a>
        </div>
      </div>
      <a href="#" id="logout" role="menuitem">Logout</a>
    </div>
  `;

  // Sélectionner les éléments
  const userButton = document.getElementById("user-button");
  const userDropdown = document.getElementById("user-dropdown");
  const settingsButton = document.getElementById("settings-button");
  const settingsSubmenu = document.getElementById("settings-submenu");
  const securityButton = document.getElementById("security-button");
  const securitySubmenu = document.getElementById("security-submenu");

  // Gérer le menu utilisateur principal
  userButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = userButton.getAttribute("aria-expanded") === "true";
    userButton.setAttribute("aria-expanded", !isExpanded);
    userDropdown.style.display = isExpanded ? "none" : "block";
  });

  // Gérer le menu Settings
  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = settingsButton.getAttribute("aria-expanded") === "true";
    settingsButton.setAttribute("aria-expanded", !isExpanded);
    settingsSubmenu.style.display = isExpanded ? "none" : "block";
  });

  // Gérer le sous-menu Security & Login
  securityButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = securityButton.getAttribute("aria-expanded") === "true";
    securityButton.setAttribute("aria-expanded", !isExpanded);
    securitySubmenu.style.display = isExpanded ? "none" : "block";
  });

  // Fermer tous les menus lorsqu'on clique en dehors
  document.addEventListener("click", (event) => {
    if (!userMenu.contains(event.target)) {
      userDropdown.style.display = "none";
      userButton.setAttribute("aria-expanded", "false");
      settingsSubmenu.style.display = "none";
      settingsButton.setAttribute("aria-expanded", "false");
      securitySubmenu.style.display = "none";
      securityButton.setAttribute("aria-expanded", "false");
    }
  });

  // Déconnexion
  document.getElementById("logout").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  });
} else {
  document.getElementById("user-menu").innerHTML = `<a href="login.html" class="login-link" aria-label="Login">Login</a>`;
}
