import CONFIG from "./config.js";

console.log("🌱 seasonal.js loaded");


const seasonsListEl = document.getElementById("seasons-list");
const monthsSection   = document.querySelector(".months");
const monthsListEl    = document.getElementById("months-list");
const monthsTitleEl   = document.getElementById("months-title");
const produceSection  = document.querySelector(".produce");
const produceListEl   = document.getElementById("produce-list");
const produceTitleEl  = document.getElementById("produce-title");

async function getSeasons() {
  const res = await fetch(`${CONFIG.API_BASE_URL}/api/produce/seasons`);
  const seasons = await res.json();
  seasonsListEl.innerHTML = seasons.map(s =>
    `<button class="season-btn" data-season="${s}">${capitalize(s)}</button>`
  ).join("");
  document.querySelectorAll(".season-btn").forEach(btn =>
    btn.addEventListener("click", () => loadMonths(btn.dataset.season))
  );
}

async function loadMonths(season) {
  monthsTitleEl.innerText = `Months in ${capitalize(season)}`;
  const res = await fetch(`${CONFIG.API_BASE_URL}/api/produce/months?season=${season}`);
  const months = await res.json();
  monthsListEl.innerHTML = months.map(m =>
    `<button class="month-btn" data-season="${season}" data-month="${m}">${capitalize(m)}</button>`
  ).join("");
  monthsSection.hidden = false;
  produceSection.hidden = true;
  document.querySelectorAll(".month-btn").forEach(btn =>
    btn.addEventListener("click", () =>
      loadProduce(btn.dataset.season, btn.dataset.month)
    )
  );
}

async function loadProduce(season, month) {
  produceTitleEl.innerText = `Produce in ${capitalize(month)} (${capitalize(season)})`;
  const res = await fetch(`${CONFIG.API_BASE_URL}/api/produce?season=${season}&month=${month}`);
  const items = await res.json();
  produceListEl.innerHTML = items.map(p => `
    <li>
      <img src="${CONFIG.API_BASE_URL}${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description || ""}</p>
    </li>
  `).join("");
  produceSection.hidden = false;
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

// Initialisation
getSeasons();

