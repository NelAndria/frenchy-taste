import CONFIG from "./config.js";

const listEl   = document.getElementById("glossary-list");
const inputEl  = document.getElementById("glossary-search");

// Debounce pour éviter les appels à chaque frappe
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function fetchEntries(term = "") {
  try {
    const url = new URL(`${CONFIG.API_BASE_URL}/api/glossary`);
    if (term) url.searchParams.set("term", term);
    const res = await fetch(url, { credentials: "include" });
    const entries = await res.json();
    render(entries);
  } catch (err) {
    listEl.innerHTML = `<li class="error">Failed to load glossary</li>`;
  }
}

function render(entries) {
  if (!entries.length) {
    listEl.innerHTML = `<li class="glossary-entry">No matches found.</li>`;
    return;
  }
  listEl.innerHTML = entries
    .map(e => `
      <li class="glossary-entry">
        <h2>${e.term}</h2>
        <p>${e.definition}</p>
      </li>
    `).join("");
}

inputEl.addEventListener("input", debounce(e => {
  fetchEntries(e.target.value.trim());
}));

// Au chargement, affiche tout
fetchEntries();
