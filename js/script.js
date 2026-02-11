const input = document.getElementById("countryInput");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");

button.addEventListener("click", () => {
    const countryName = input.value.trim();

    if (countryName === "") {
        result.innerHTML = "Please enter a country name.";
        return;
    }

    fetchCountry(countryName);
});

async function fetchCountry(name) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);

        if (!response.ok) {
            throw new Error("Country not found");
        }

        const data = await response.json();
        displayCountry(data[0]);

    } catch (error) {
        result.innerHTML = `<p>${error.message}</p>`;
    }
}

async function displayCountry(country) {
    const currencyCode = Object.keys(country.currencies)[0];
    const currencyName = country.currencies[currencyCode].name;

    
    let rateText = "Loading exchange rate...";

    try {
        const rateResponse = await fetch(`https://open.er-api.com/v6/latest/${currencyCode}`);
        const rateData = await rateResponse.json();

        const usdRate = rateData.rates["USD"];

        rateText = `1 ${currencyCode} = ${usdRate} USD`;

    } catch {
        rateText = "Exchange rate unavailable";
    }

    result.innerHTML = `
        <h2>${country.name.official}</h2>
        <img src="${country.flags.png}" width="150">
        <p><strong>Capital:</strong> ${country.capital[0]}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Currency:</strong> ${currencyName} (${currencyCode})</p>
        <p><strong>Exchange Rate:</strong> ${rateText}</p>
    `;
}