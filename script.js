// DOM elements
const cityInput = document.querySelector("#city_id");
const searchButton = document.querySelector("#search_button");
const statusElement = document.querySelector("#status");

const locationElement = document.querySelector("#location");
const temperatureElement = document.querySelector("#temperature");
const conditionElement = document.querySelector("#condition");

const feelsLikeElement = document.querySelector("#feelsLike");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");
const precipitationElement = document.querySelector("#precipitation");

const hourlyForecastElement = document.querySelector("#hourlyForecast");
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

        const weather = await getWeather(location.latitude, location.longitude);

        displayWeather(location, weather);

        showStatus("");
    } catch (error) {
        console.error(error);
        showStatus("Weather for this city could not be found");
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

// Weather API 
async function getWeather(latitude, longitude) {
    const url = 
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=${[
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m"
        ].join(",")}` +
        "&hourly=temperature_2m,precipitation_probability,weather_code" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&forecast_days=7" +
        "&timezone=auto";

    const response = await fetch (url);

    if(!response.ok) {
        throw new Error("Weather request failed");
    }

    return await response.json();
}

// display current weather
function displayWeather(location, weather) {
    const current = weather.current;
    locationElement.textContent = 
        `${location.name}, ${location.country}`;

    temperatureElement.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    feelsLikeElement.textContent = 
        `${Math.round(current.apparent_temperature)}°C`;

    conditionElement.textContent = 
        getWeatherDescription(current.weather_code);

    humidityElement.textContent = 
        `${current.relative_humidity_2m}%`;

    windElement.textContent = 
        `${Math.round(current.wind_speed_10m)} km/h`;

    precipitationElement.textContent = 
        `${current.precipitation} mm`;
    
    displayHourlyForecast(weather.hourly, current.time);
    displayDailyForecast(weather.daily);

}

function getWeatherDescription(code) {
    const description = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Rime Fog",
        51: "Light drizzle",
        53: "Dirzzle",
        55: "Heavy drizzle",
        61: "Light rain",
        63: "Rain",
        65: "Heavy rain",
        71: "Light snow",
        73: "Snow",
        75: "Heavy snow",
        80: "Rain showers",
        81: "Heavy rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    };
    return description[code] || "unknown";
}

function displayHourlyForecast(hourly, currentTime) {
    hourlyForecastElement.innerHTML = "";

    let startIndex = hourly.time.findIndex(
        time => time >= currentTime
    );

    if (startIndex === -1) {
        startIndex = 0;
    }

    const endIndex = Math.min(
        startIndex + 24,
        hourly.time.length
    );

    for (let i = startIndex; i < endIndex; i++) {
        const hourElement = document.createElement("div");
        hourElement.classList.add("hour");
        hourElement.innerHTML = 
            `<div class="hour-time">
                ${formatHour(hourly.time[i])}
            </div>

            <div class="hour-icon">
                ${getWeatherIcon(hourly.weather_code[i])}
            </div>

             <div class="hour-temperature">
                ${Math.round(hourly.temperature_2m[i])}°C
            </div>

            <small>
                ${hourly.precipitation_probability[i]}% rain
            </small>
            `;

            hourlyForecastElement.appendChild(hourElement);
    }
}

function displayDailyForecast(daily) {
    dailyForecastElement.innerHTML = "";

    for (let i = 0; i<daily.time.length; i++) {
        const dayElement = document.createElement("div");

        dayElement.classList.add("day");
        dayElement.innerHTML = `
        <div class="day-name">
            ${formatDay(daily.time[i])}
        </div>

        <div class="day-date">
            ${formatDate(daily.time[i])}
        </div>

        <div class="day-icon">
            ${getWeatherIcon(daily.weather_code[i])}
        </div>

        <strong>
            ${Math.round(daily.temperature_2m_max[i])}°
        </strong>

        <strong>
            ${Math.round(daily.temperature_2m_min[i])}°
        </strong>
        `

        dailyForecastElement.appendChild(dayElement);
    }

}

function formatHour(dateString) {
    return new Date(dateString).toLocaleTimeString([],{
        hour: "2-digit",
        minute: "2-digit"
    }); 
}

function formatDay(dateString) {
    return new Date(dateString).toLocaleDateString([], {
        weekday: "short"
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString([], {
        day: "2-digit",
        month: "2-digit"
    });
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌁";
  if (code >= 51 && code <= 65) return "🌧️";
  if (code >= 71 && code <= 75) return "🌨️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";

  return "🌡️";
}

function showStatus(message) {
    statusElement.textContent = message;
}

searchWeather();
