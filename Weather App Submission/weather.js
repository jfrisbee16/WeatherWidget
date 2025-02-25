const regCity = /^[\p{L}]+(?:[\s\p{L}'-][\p{L}]+)*$/u;
const strDefaultCity = "Cookeville";

// Mapping Weather Variables
const weatherConditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

const weatherIconsDay = {
    "Clear sky":"clear-day.svg",
    "Mainly clear":"clear-day.svg",
    "Partly cloudy":"partly-cloudy-day.svg",
    "Overcast":"overcast-day.svg",
    "Fog":"fog-day.svg",
    "Depositing rime fog":"fog.svg",
    "Light drizzle":"partly-cloudy-day-drizzle.svg",
    "Moderate drizzle":"drizzle.svg",
    "Dense drizzle":"drizzle.svg",
    "Light rain":"rain.svg",
    "Moderate rain":"rain.svg",
    "Heavy rain":"rain.svg",
    "Light snow":"snow.svg",
    "Moderate snow":"snow.svg",
    "Heavy snow":"snow.svg",
    "Light rain showers":"rain.svg",
    "Moderate rain showers":"rain.svg",
    "Heavy rain showers":"rain.svg",
    "Thunderstorm":"thunderstorm-rain.svg",
    "Thunderstorm with slight hail":"hail.svg",
    "Thunderstorm with heavy hail":"hail.svg"
}

const weatherIconsNight = {
    "Clear sky":"clear-night.svg",
    "Mainly clear":"clear-night.svg",
    "Partly cloudy":"partly-cloudy-night.svg",
    "Overcast":"overcast-night.svg",
    "Fog":"fog-night.svg",
    "Depositing rime fog":"fog.svg",
    "Light drizzle":"partly-cloudy-night-drizzle.svg",
    "Moderate drizzle":"drizzle.svg",
    "Dense drizzle":"drizzle.svg",
    "Light rain":"rain.svg",
    "Moderate rain":"rain.svg",
    "Heavy rain":"rain.svg",
    "Light snow":"snow.svg",
    "Moderate snow":"snow.svg",
    "Heavy snow":"snow.svg",
    "Light rain showers":"rain.svg",
    "Moderate rain showers":"rain.svg",
    "Heavy rain showers":"rain.svg",
    "Thunderstorm":"thunderstorm-rain.svg",
    "Thunderstorm with slight hail":"hail.svg",
    "Thunderstorm with heavy hail":"hail.svg"
}


let strCityLongitude = ''
let strCityLatitude = ''

// Set default city on load
document.addEventListener("DOMContentLoaded", () => {
    fetch("https://api.ipify.org?format=json")
        .then(response => response.json())
        .then(dataIP => {
            const userIP = dataIP.ip;
            console.log(userIP);
            fetch(`http://ip-api.com/json/${userIP}`)
                .then(response => response.json())
                .then(dataLocation => {
                    console.log(dataLocation);
                    const cityIP = dataLocation.city;
                    console.log(cityIP);
                    // Now you can call fetchLocation here
                    fetchLocation(cityIP);
                })
                .catch(error => {
                    console.error("Error fetching location:", error);
                });
        })
        .catch(error => {
            console.error("Error fetching IP address:", error);
        });
});


// Handler for Pressing Enter - City Search
document.querySelector('#txtCity').addEventListener("keydown", async function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const strCity = document.querySelector('#txtCity').value.trim();

        if (!regCity.test(strCity)) {
            Swal.fire({
                title: "Error",
                text: "Enter a valid city",
                icon: "error"
            });
            return;
        }

        fetchLocation(strCity);
    }
});

// Fetch Location Function ** This Function also calls the FetchWeather Function
async function fetchLocation(strLocation) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${strLocation}&count=1&language=en&format=json`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            Swal.fire({ title: "Error", text: "City not found", icon: "error" });
            return;
        }

        const cityData = data.results[0];
        console.log(`Latitude: ${cityData.latitude}, Longitude: ${cityData.longitude}`);
        
        // Assign city name
        document.getElementById('headerCity').textContent = cityData.name;

        // Now fetch weather with the retrieved coordinates
        fetchWeather(cityData.latitude, cityData.longitude);
    } catch (error) {
        console.error('Error fetching location data:', error);
    }
}


async function fetchWeather(latitude, longitude) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,snowfall,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        if (!data.current || data.current.weather_code === undefined) {
            console.log('Error, Weather Conditions not found');
            return;
        }

        // Get weather condition
        const objWeatherCondition = data.current.weather_code;
        console.log('Conditons: ', objWeatherCondition);
        // Get weather temperature
        const objWeatherTemperature = data.current.temperature_2m;
        console.log('Temp: ', objWeatherTemperature)
        // Get weather wind speed
        const objWeatherWind = data.current.wind_speed_10m;
        console.log('Wind Speed: ', objWeatherWind);
        // Get weather Humidity
        const objWeatherHumid = data.current.relative_humidity_2m;
        console.log('Relative Humidity: ', objWeatherHumid);

        // Convert code to condition text
        const conditionText = weatherConditions[objWeatherCondition] || "Unknown";

        // Determine if it's day or night
        const isDay = data.current.is_day === 1;

        // Get appropriate icon for Day/Night
        const iconPath = isDay
            ? `Animated-Line-Icons/${weatherIconsDay[conditionText]}`
            : `Animated-Line-Icons/${weatherIconsNight[conditionText]}`;

        // Update weather icon
        const imgCondition = document.getElementById('imgConditions');
        if (imgCondition) {
            imgCondition.src = iconPath;
        } else {
            console.error("Error: imgConditions element not found.");
        }

        // Update Condition Header
        const headerCondition = document.getElementById('headerConditions');
        if (headerCondition) {
            headerCondition.innerHTML = weatherConditions[objWeatherCondition];
        } else {
            console.error("Error: headerConditions element not found");
        }

        // Update Temperature Header
        const headerTemperature = document.getElementById('headerTemperature');
        if (headerTemperature) {
            headerTemperature.innerHTML = objWeatherTemperature + ' &deg;F';
        } else {
            console.error("Error: headerTemperature element not found");
        }

        // Update Wind Header
        const headerWind = document.getElementById('headerWind');
        if (headerWind) {
            headerWind.innerHTML = objWeatherWind + ' mph';
        } else {
            console.error("Error: headerWInd element not found");
        }

        const headerHumidity = document.getElementById('headerHumid');
        if(headerHumidity) {
            headerHumidity.innerHTML = objWeatherHumid + '%';
        } else {
            console.error('Error: headerHumid element not found');
        }

    } catch (error) {
        console.error('Error fetching Weather Conditions:', error);
    }
}
