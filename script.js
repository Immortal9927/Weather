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

        const location = await GeolocationCoordinates(city);

        const weather = await getWeather(latitude, longitude);

        displayWeather(location, weather);

        showStatus("");
    } catch (error) {
        console.error(error);
        showStatus("Weather for this city could not be found");
    }
}
