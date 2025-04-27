// Handles UI rendering and interaction

import * as F from "./formatting.js";
import * as L from "./landmarks.js";
import * as Map from "./map.js";
import * as Charts from "./charts.js";
import { iconBase } from "./landmarks.js";

// Build a weather card for a city
export function buildCityCard(city) {
  const card = document.createElement("div");
  card.className =
    "bg-secondary-dark/80 backdrop-blur-md rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border border-white/10 flex flex-col relative animate-fadeInUp weather-card";
  card.id = city.id;
  card.dataset.lat = city.lat;
  card.dataset.lon = city.lon;

  // Add top border gradient
  card.innerHTML = `<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-blue to-accent-purple z-10 transition-all duration-300 group-hover:h-1.5"></div>`;

  const data = city.weather;
  const icon = `${iconBase}${data.weather[0].icon}@2x.png`;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);

  // Create landmark container
  const landmarkContainer = document.createElement("div");
  landmarkContainer.className =
    "relative w-full h-44 overflow-hidden bg-primary-dark";
  landmarkContainer.innerHTML = `
    <img src="${city.landmark}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
         alt="${city.name}" 
         onerror="this.src='${L.placeholderLandmark}';this.classList.add('error')">
    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
      <span class="text-lg font-semibold">${city.name}</span>
    </div>
  `;

  // Create card content
  const cardContent = document.createElement("div");
  cardContent.className = "p-6 flex-grow flex flex-col";

  // City info
  const locationInfo = document.createElement("div");
  locationInfo.className = "flex justify-between items-start mb-4";
  locationInfo.innerHTML = `
    <div class="flex items-center gap-2">
      <h2 class="text-2xl font-semibold m-0">${city.name}</h2>
      ${
        city.isCapital
          ? '<span class="bg-accent-gold text-primary-dark px-2 py-1 rounded text-xs font-semibold">Capital</span>'
          : ""
      }
    </div>
    <img src="${city.flag}" class="w-6 h-4 rounded shadow" alt="${
    city.country
  } flag" 
         onerror="this.src='${L.placeholderFlag}';this.classList.add('error')">
  `;

  // Country name
  const countryName = document.createElement("div");
  countryName.className = "text-text-secondary mb-4";
  countryName.textContent = city.country;

  // Weather main
  const weatherMain = document.createElement("div");
  weatherMain.className = "flex items-center justify-between mb-6";
  weatherMain.innerHTML = `
    <div class="text-4xl font-bold flex items-center gap-2">
      ${temp}°C
      <img class="w-16 h-16 filter drop-shadow" src="${icon}" alt="${data.weather[0].description}">
    </div>
    <div class="text-right text-text-secondary text-lg capitalize">
      ${data.weather[0].description}
    </div>
  `;

  // Weather details
  const weatherDetails = document.createElement("div");
  weatherDetails.className =
    "grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg mt-auto";
  weatherDetails.innerHTML = `
    <div class="flex flex-col gap-1">
      <span class="text-text-secondary text-xs uppercase tracking-wider">Feels Like</span>
      <span class="font-medium text-lg">${feelsLike}°C</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-text-secondary text-xs uppercase tracking-wider">Humidity</span>
      <span class="font-medium text-lg">${F.formatHumidity(
        data.main.humidity
      )}</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-text-secondary text-xs uppercase tracking-wider">Wind</span>
      <span class="font-medium text-lg">${F.formatWindSpeed(
        data.wind.speed
      )} ${F.getWindDirection(data.wind.deg)}</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-text-secondary text-xs uppercase tracking-wider">Pressure</span>
      <span class="font-medium text-lg">${F.formatPressure(
        data.main.pressure
      )}</span>
    </div>
    
    <div class="col-span-2 flex justify-between border-t border-white/10 pt-3 mt-2">
      <div class="flex items-center gap-2">
        <i class="fas fa-sun text-accent-gold"></i>
        <span>${city.sunrise}</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="fas fa-moon text-accent-gold"></i>
        <span>${city.sunset}</span>
      </div>
    </div>
  `;

  // Add action buttons for forecast and map
  const cardButtons = document.createElement("div");
  cardButtons.className = "card-buttons mt-4 flex gap-2";
  cardButtons.innerHTML = `
    <button class="card-btn forecast-btn" data-action="forecast">
      <i class="fas fa-chart-line mr-2"></i> Forecast
    </button>
    <button class="card-btn map-btn" data-action="map">
      <i class="fas fa-map-marker-alt mr-2"></i> View Map
    </button>
  `;

  // Append all elements to the card
  cardContent.appendChild(locationInfo);
  cardContent.appendChild(countryName);
  cardContent.appendChild(weatherMain);
  cardContent.appendChild(weatherDetails);
  cardContent.appendChild(cardButtons);

  card.appendChild(landmarkContainer);
  card.appendChild(cardContent);

  // Add event listeners for the buttons
  const forecastBtn = cardButtons.querySelector('[data-action="forecast"]');
  const mapBtn = cardButtons.querySelector('[data-action="map"]');

  forecastBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    document.dispatchEvent(new CustomEvent("openForecast", { detail: city }));
  });

  mapBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    document.dispatchEvent(new CustomEvent("openMap", { detail: city }));
  });

  return card;
}

// Toast notification
export function toast(message) {
  const toastEl = document.getElementById("weatherToast");
  if (!toastEl) return;

  const messageEl = document.getElementById("toastMessage");
  if (messageEl) messageEl.textContent = message;

  // Create a Bootstrap toast instance if not already
  let bsToast = bootstrap.Toast.getInstance(toastEl);
  if (!bsToast) {
    bsToast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 3000,
    });
  }

  bsToast.show();
}

// Process forecast data - now delegated to Charts module
export function processForecastData(forecast) {
  return Charts.processForecastData(forecast);
}

// Draw temperature chart - now delegated to Charts module
export function drawTemperatureChart(data) {
  return Charts.drawTemperatureChart(data);
}

// Draw precipitation chart - now delegated to Charts module
export function drawPrecipitationChart(data) {
  return Charts.drawPrecipitationChart(data);
}

// Draw wind chart - now delegated to Charts module
export function drawWindChart(data) {
  return Charts.drawWindChart(data);
}

// Draw humidity chart - now delegated to Charts module
export function drawHumidityChart(data) {
  return Charts.drawHumidityChart(data);
}

// Render daily forecast - now delegated to Charts module
export function renderDailyForecast(data) {
  return Charts.renderDailyForecast(data, iconBase);
}

// Switch between tabs - now delegated to Charts module
export function switchTab(tabName) {
  return Charts.switchTab(tabName);
}

// Clean up chart resources - now delegated to Charts module
export function destroyCharts() {
  return Charts.destroyCharts();
}

// Modal control
export function showModal(modalId, title) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Set title if provided and element exists
  if (title) {
    const titleEl = modal.querySelector(".modal-title");
    if (titleEl) titleEl.textContent = title;
  }

  // Use Bootstrap's modal API
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const bsModal = bootstrap.Modal.getInstance(modal);
  if (bsModal) {
    bsModal.hide();
  }
}

// Map handling - now delegated to Map module
export function initMap(city) {
  return Map.initMap(city);
}

export function addMapMarkers(cities) {
  return Map.addMapMarkers(cities);
}

export function clearMapMarkers() {
  return Map.clearMapMarkers();
}
