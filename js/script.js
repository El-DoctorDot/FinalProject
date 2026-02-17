const input = document.getElementById("countryInput");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");
const suggestionsBox = document.getElementById("suggestions");
const historyDropdown = document.getElementById("historyDropdown");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const themeToggle = document.getElementById("themeToggle");


themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "Light Mode";
}


button.addEventListener("click", handleSearch);

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

input.addEventListener("focus", () => {
    renderHistory();
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) {
        suggestionsBox.innerHTML = "";
        historyDropdown.innerHTML = "";
    }
});


input.addEventListener("input", () => {
    result.innerHTML = "";
    historyDropdown.innerHTML = ""; // 🔥 esconde histórico ao digitar
});


window.addEventListener("load", loadLastCountry);


clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("history");
    renderHistory();
});


function handleSearch() {
    const countryName = input.value.trim();

    if (!countryName) {
        showError("Please enter a country name.");
        return;
    }

    fetchCountry(countryName);
}


async function fetchCountry(name) {
    try {

        result.innerHTML = '<div class="loader"></div>';

        const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);

        if (!response.ok) {
            throw new Error("Country not found");
        }

        const data = await response.json();

        // Robust logic: multiple results
        if (data.length > 1) {
            showSuggestions(data);
            return;
        }

        displayCountry(data[0]);

    } catch (error) {
        showError(error.message);
    }
}


async function displayCountry(country) {
    result.innerHTML = "";

    const currencyCode = Object.keys(country.currencies)[0];
    const currencyName = country.currencies[currencyCode].name;

    const languages = Object.values(country.languages).join(", ");
    const timezones = country.timezones.join(", ");
    const borders = country.borders ? country.borders.join(", ") : "None";

    const exchangeRate = await getExchangeRate(currencyCode);

    const card = createCountryCard({
        name: country.name.official,
        flag: country.flags.png,
        capital: country.capital?.[0] || "N/A",
        region: country.region,
        subregion: country.subregion,
        population: country.population.toLocaleString(),
        area: country.area.toLocaleString(),
        languages,
        timezones,
        borders,
        currency: `${currencyName} (${currencyCode})`,
        exchangeRate,
        map: country.maps.googleMaps
    });

    result.appendChild(card);

    
    saveToHistory(country.name.official);
    saveLastCountry(country);
}

function renderHistory() {
    suggestionsBox.innerHTML = ""; // 🔥 esconde sugestões
    historyDropdown.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("history")) || [];

    history.slice().reverse().forEach(country => {
        const item = document.createElement("div");
        item.textContent = country;

        item.addEventListener("click", () => {
            fetchCountry(country);
            historyDropdown.innerHTML = "";
        });

        historyDropdown.appendChild(item);
    });
}




async function getExchangeRate(currencyCode) {
    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${currencyCode}`);
        const data = await response.json();
        const usdRate = data.rates["USD"];

        return `1 ${currencyCode} = ${usdRate} USD`;
    } catch {
        return "Exchange rate unavailable";
    }
}




function createCountryCard(data) {
    const card = document.createElement("div");
    card.classList.add("country-card");

    card.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${data.flag}" width="150">
        <p><strong>Capital:</strong> ${data.capital}</p>
        <p><strong>Region:</strong> ${data.region}</p>
        <p><strong>Subregion:</strong> ${data.subregion}</p>
        <p><strong>Population:</strong> ${data.population}</p>
        <p><strong>Area:</strong> ${data.area} km²</p>
        <p><strong>Languages:</strong> ${data.languages}</p>
        <p><strong>Timezones:</strong> ${data.timezones}</p>
        <p><strong>Borders:</strong> ${data.borders}</p>
        <p><strong>Currency:</strong> ${data.currency}</p>
        <p><strong>Exchange Rate:</strong> ${data.exchangeRate}</p>
        <p><a href="${data.map}" target="_blank">View on Google Maps</a></p>
    `;

    return card;
}


function showSuggestions(countries) {
    historyDropdown.innerHTML = ""; // 🔥 esconde histórico
    suggestionsBox.innerHTML = "";

    countries.slice(0, 5).forEach(country => {
        const option = document.createElement("button");
        option.textContent = country.name.official;

        option.addEventListener("click", () => {
            suggestionsBox.innerHTML = "";
            displayCountry(country);
        });

        suggestionsBox.appendChild(option);
    });
}




function saveLastCountry(country) {
    localStorage.setItem("lastCountry", JSON.stringify({
        name: country.name.official,
        capital: country.capital?.[0] || "N/A",
        population: country.population,
        currency: Object.keys(country.currencies)[0],
        flag: country.flags.png
    }));
}

function saveToHistory(countryName) {
    let history = JSON.parse(localStorage.getItem("history")) || [];

    if (!history.includes(countryName)) {
        history.push(countryName);
        localStorage.setItem("history", JSON.stringify(history));
    }

    renderHistory();
}

function loadLastCountry() {
    renderHistory();

    const saved = localStorage.getItem("lastCountry");
    if (!saved) return;

    const country = JSON.parse(saved);

    const card = createCountryCard({
        name: country.name,
        flag: country.flag,
        capital: country.capital,
        region: "Saved Data",
        subregion: "-",
        population: country.population.toLocaleString(),
        area: "-",
        languages: "-",
        timezones: "-",
        borders: "-",
        currency: country.currency,
        exchangeRate: "Search again to refresh rate",
        map: "#"
    });

    result.appendChild(card);
}



function showError(message) {
    result.innerHTML = `<p style="color:red;">${message}</p>`;
}