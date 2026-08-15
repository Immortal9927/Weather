// DOM elements
const cityInput = document.querySelector("#cityInput");
const searchButton = document.querySelector("#searchButton");
const statusElement = document.querySelector("#status");

const locationElement = document.querySelector("#location");
const temperatureElement = document.querySelector("#temperature");
const conditionElement = document.querySelector("#condition");

const feelsLikeElement = document.querySelector("#feelsLike");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#condition");
const precipitationElement = document.querySelector("#precipitation");

const hourlyForecastElement = document.querySelector("hourlyForecast");
const dailyForecastElement = document.querySelector("#dailyForecast");

// Event Listener
searchButton.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function (event){
    if (event.key === "Enter") {
        searchWeather();
    }
})

// search city
async function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        showStatus("Please enter a city.");
        return;
    }

    try {
        showStatus("Searching...");

        const location = await getCoordinates(city);

        const weather = await getWeather(latitude, longitude);

        displayWeather(location, weather);

        showStatus("");
    } catch (error) {
        console.error(error);
  $      showStatus("Weather for this city could not be found");
    }
}

// Geocoding API
async function getCoordinates(city) {
    const url = "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(city)}` +
    "&count=1" +
    "&language=en" +
    "&format=json";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    return data.results[0];
}
