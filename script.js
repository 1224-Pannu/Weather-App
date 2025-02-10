// DOM elements
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const cityInput = document.getElementById('city-input');
const weatherDetails = document.getElementById('weather-details');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const weatherIcon = document.getElementById('weather-icon').querySelector('img');
const minMaxValue = document.getElementById('min-max-value');
const humidityValue = document.getElementById('humidity-value');
const windSpeedValue = document.getElementById('wind-speed-value');
const feelsLikeValue = document.getElementById('feels-like-value');
const pressureValue = document.getElementById('pressure-value');
const sunriseValue = document.getElementById('sunrise-value');
const sunsetValue = document.getElementById('sunset-value');
const windTypeBox = document.getElementById('wind-type-box');
const airQualityValue = document.getElementById('air-quality-value');
const forecastContainer = document.querySelector('.forecast-container');

// OpenWeatherMap API Key
const apiKey = 'a9a90f3c09f7c11d75bf2e91429eda64';

// Function to format time
function formatTime(unixTime) {
  const date = new Date(unixTime * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Function to get wind type based on speed
function getWindType(speed) {
  if (speed < 1) return 'Calm';
  if (speed < 5) return 'Light Breeze';
  if (speed < 10) return 'Moderate Breeze';
  if (speed < 20) return 'Strong Breeze';
  return 'Gale';
}

// Function to fetch weather by city name
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name!');
    return;
  }

  fetchWeatherData(city);
});

// Function to fetch weather by current location
currentLocationBtn.addEventListener('click', fetchWeatherByCurrentLocation);

function fetchWeatherByCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(null, latitude, longitude);
      },
      () => {
        alert('Unable to access your location. Please enable location services.');
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

// Function to fetch weather data
function fetchWeatherData(city, lat, lon) {
  const url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('City not found');
      }
      return response.json();
    })
    .then((data) => {
      // Update weather details
      updateWeatherDetails(data);
      // Fetch 5-day forecast
      fetchForecast(data.coord.lat, data.coord.lon);
    })
    .catch((error) => {
      alert(error.message || 'An error occurred. Please try again.');
    });
}

// Function to update weather details in the UI
function updateWeatherDetails(data) {
  cityName.textContent = data.name;
  temperature.textContent = `${data.main.temp.toFixed(1)}°C`;
  condition.textContent =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  minMaxValue.textContent = `${data.main.temp_min.toFixed(1)}°C / ${data.main.temp_max.toFixed(1)}°C`;
  humidityValue.textContent = `${data.main.humidity}%`;
  windSpeedValue.textContent = `${data.wind.speed.toFixed(1)} m/s`;
  feelsLikeValue.textContent = `${data.main.feels_like.toFixed(1)}°C`;
  pressureValue.textContent = `${data.main.pressure} hPa`;
  sunriseValue.textContent = formatTime(data.sys.sunrise);
  sunsetValue.textContent = formatTime(data.sys.sunset);
  windTypeBox.querySelector('p').textContent = getWindType(data.wind.speed);
  airQualityValue.textContent = '--'; // Placeholder for air quality

  // Show weather details
  weatherDetails.classList.remove('hidden');
}

// Function to fetch 5-day forecast
function fetchForecast(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  fetch(forecastUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to fetch forecast data');
      }
      return response.json();
    })
    .then((data) => {
      displayForecast(data);
    })
    .catch((error) => {
      console.error('Error fetching forecast:', error);
    });
}

// Function to display the 5-day forecast
function displayForecast(data) {
  forecastContainer.innerHTML = ''; // Clear previous forecast
  const dailyData = {};

  // Group forecast data by date
  data.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });

  // Create forecast elements
  for (const date in dailyData) {
    const dayData = dailyData[date];
    const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
    const weatherCondition = dayData[0].weather[0].description;
    const weatherIcon = dayData[0].weather[0].icon;

    const forecastItem = document.createElement('div');
    forecastItem.classList.add('forecast-item');
    forecastItem.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherCondition}">
      <p>${weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1)}</p>
      <p>Avg Temp: ${avgTemp.toFixed(1)}°C</p>
    `;
    forecastContainer.appendChild(forecastItem);
  }

  // Show forecast section
  document.getElementById('forecast').classList.remove('hidden');
}
