import * as U from "./utils.js";

// Chart instances
const charts = {
  temperature: null,
  precipitation: null,
  wind: null,
  humidity: null,
};

// Map instance
let map = null;
let mapMarkers = [];

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
  const icon = `${U.iconBase}${data.weather[0].icon}@2x.png`;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);

  // Create landmark container
  const landmarkContainer = document.createElement("div");
  landmarkContainer.className =
    "relative w-full h-44 overflow-hidden bg-primary-dark";
  landmarkContainer.innerHTML = `
    <img src="${city.landmark}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
         alt="${city.name}" 
         onerror="this.src='${U.placeholderLandmark}';this.classList.add('error')">
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
         onerror="this.src='${U.placeholderFlag}';this.classList.add('error')">
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
      <span class="font-medium text-lg">${data.main.humidity}%</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-text-secondary text-xs uppercase tracking-wider">Wind</span>
      <span class="font-medium text-lg">${Math.round(
        data.wind.speed
      )} m/s ${U.getWindDirection(data.wind.deg)}</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-text-secondary text-xs uppercase tracking-wider">Pressure</span>
      <span class="font-medium text-lg">${data.main.pressure} hPa</span>
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

// Process forecast data
export function processForecastData(forecast) {
  // Group by date (one entry per day)
  const groupedByDate = {};
  const hourlyData = {};

  forecast.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const hour = item.dt_txt.split(" ")[1].slice(0, 5);

    // Store hourly data
    if (!hourlyData[date]) {
      hourlyData[date] = [];
    }

    hourlyData[date].push({
      hour,
      temp: Math.round(item.main.temp),
      precipitation: item.rain ? item.rain["3h"] || 0 : 0,
      windSpeed: Math.round(item.wind.speed),
      windDirection: item.wind.deg,
      humidity: item.main.humidity,
      weather: item.weather[0],
      icon: item.weather[0].icon,
    });

    // For daily summary, use noon data or last entry of the day
    if (item.dt_txt.includes("12:00:00") || !groupedByDate[date]) {
      groupedByDate[date] = {
        temp: Math.round(item.main.temp),
        precipitation: item.rain ? item.rain["3h"] || 0 : 0,
        windSpeed: Math.round(item.wind.speed),
        humidity: item.main.humidity,
        weather: item.weather[0],
        icon: item.weather[0].icon,
      };
    }
  });

  return {
    daily: Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      ...data,
    })),
    hourly: hourlyData,
  };
}

// Draw temperature chart
export function drawTemperatureChart(data) {
  // Get the first 5 days of hourly data
  const days = Object.keys(data.hourly).slice(0, 5);
  const datasets = [];

  // Create a dataset for each day
  days.forEach((day, index) => {
    const dayData = data.hourly[day];
    const formattedDay = new Date(day).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    // Map temperature data for each hour
    const tempData = dayData.map((hourData) => ({
      x: hourData.hour,
      y: hourData.temp,
    }));

    // Add dataset for this day
    datasets.push({
      label: formattedDay,
      data: tempData,
      borderColor: U.getChartColor(index),
      backgroundColor: U.getChartColor(index),
      tension: 0.3,
      pointBackgroundColor: U.getChartColor(index),
      pointRadius: 4,
    });
  });

  // Destroy previous chart if exists
  if (charts.temperature) {
    charts.temperature.destroy();
  }

  // Create new chart
  const ctx = document.getElementById("temperatureChart");
  if (!ctx) return null;

  const context = ctx.getContext("2d");
  charts.temperature = new Chart(context, {
    type: "line",
    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y}°C`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Hour",
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: function (value) {
              return value + "°C";
            },
          },
        },
      },
    },
  });

  return charts.temperature;
}

// Draw precipitation chart
export function drawPrecipitationChart(data) {
  // Get the first 5 days
  const days = Object.keys(data.hourly).slice(0, 5);
  const labels = [];
  const precipData = [];

  // Prepare data for each day
  days.forEach((day) => {
    const formattedDay = new Date(day).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dayData = data.hourly[day];

    // Calculate total precipitation for the day
    const totalPrecip = dayData.reduce(
      (sum, hour) => sum + hour.precipitation,
      0
    );

    labels.push(formattedDay);
    precipData.push(Math.round(totalPrecip * 10) / 10); // Round to 1 decimal place
  });

  // Destroy previous chart if exists
  if (charts.precipitation) {
    charts.precipitation.destroy();
  }

  // Create new chart
  const ctx = document.getElementById("precipitationChart");
  if (!ctx) return null;

  const context = ctx.getContext("2d");
  charts.precipitation = new Chart(context, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Precipitation (mm)",
          data: precipData,
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          callbacks: {
            label: function (context) {
              return `${context.parsed.y} mm`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Precipitation (mm)",
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: function (value) {
              return value + " mm";
            },
          },
        },
      },
    },
  });

  return charts.precipitation;
}

// Draw wind chart
export function drawWindChart(data) {
  // Get the first 5 days
  const days = Object.keys(data.hourly).slice(0, 5);
  const labels = [];
  const windData = [];

  // Prepare data for each day
  days.forEach((day) => {
    const formattedDay = new Date(day).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dayData = data.hourly[day];

    // Calculate average wind speed for the day
    const totalWind = dayData.reduce((sum, hour) => sum + hour.windSpeed, 0);
    const avgWind = Math.round((totalWind / dayData.length) * 10) / 10;

    labels.push(formattedDay);
    windData.push(avgWind);
  });

  // Destroy previous chart if exists
  if (charts.wind) {
    charts.wind.destroy();
  }

  // Create new chart
  const ctx = document.getElementById("windChart");
  if (!ctx) return null;

  const context = ctx.getContext("2d");
  charts.wind = new Chart(context, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Wind Speed (m/s)",
          data: windData,
          backgroundColor: "rgba(139, 92, 246, 0.7)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          callbacks: {
            label: function (context) {
              return `${context.parsed.y} m/s`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Wind Speed (m/s)",
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: function (value) {
              return value + " m/s";
            },
          },
        },
      },
    },
  });

  return charts.wind;
}

// Draw humidity chart
export function drawHumidityChart(data) {
  // Get the first 5 days
  const days = Object.keys(data.hourly).slice(0, 5);
  const datasets = [];

  // Create a dataset for each day
  days.forEach((day, index) => {
    const dayData = data.hourly[day];
    const formattedDay = new Date(day).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    // Map humidity data for each hour
    const humidityData = dayData.map((hourData) => ({
      x: hourData.hour,
      y: hourData.humidity,
    }));

    // Add dataset for this day
    datasets.push({
      label: formattedDay,
      data: humidityData,
      borderColor: U.getChartColor(index),
      backgroundColor: U.getChartColor(index),
      tension: 0.3,
      pointBackgroundColor: U.getChartColor(index),
      pointRadius: 4,
    });
  });

  // Destroy previous chart if exists
  if (charts.humidity) {
    charts.humidity.destroy();
  }

  // Create new chart
  const ctx = document.getElementById("humidityChart");
  if (!ctx) return null;

  const context = ctx.getContext("2d");
  charts.humidity = new Chart(context, {
    type: "line",
    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Hour",
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Humidity (%)",
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });

  return charts.humidity;
}

// Render 5-day forecast
export function renderDailyForecast(data) {
  const dailyForecastElement = document.getElementById("dailyForecast");
  if (!dailyForecastElement) return;

  dailyForecastElement.innerHTML = "";

  // Create a card for each day (limit to 5 days)
  data.daily.slice(0, 5).forEach((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dayCard = document.createElement("div");
    dayCard.className =
      "bg-white/5 rounded-lg p-4 text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg";
    dayCard.innerHTML = `
      <div class="font-semibold">${dayName}</div>
      <div class="text-sm text-text-secondary">${monthDay}</div>
      <img src="${U.iconBase}${day.icon}@2x.png" class="w-12 h-12 mx-auto my-2" alt="${day.weather.description}">
      <div class="text-xl font-bold my-2">${day.temp}°C</div>
      <div class="text-sm text-text-secondary">${day.weather.description}</div>
      <div class="mt-2 text-xs text-text-secondary">
        <span class="block"><i class="fas fa-wind mr-1"></i> ${day.windSpeed} m/s</span>
        <span class="block"><i class="fas fa-tint mr-1"></i> ${day.humidity}%</span>
      </div>
    `;

    dailyForecastElement.appendChild(dayCard);
  });
}

// Switch between tabs in the forecast modal
export function switchTab(tabName) {
  // Update active tab button
  const tabButtons = document.querySelectorAll("[data-tab]");
  tabButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-tab") === tabName;
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("text-accent-blue", isActive);
    btn.classList.toggle("border-b-2", isActive);
    btn.classList.toggle("border-accent-blue", isActive);
    btn.classList.toggle("text-text-secondary", !isActive);
    btn.classList.toggle("border-transparent", !isActive);
  });

  // Update visible tab content
  document.querySelectorAll(".tab-pane").forEach((content) => {
    if (content.id === tabName) {
      content.classList.add("show", "active");
      content.classList.remove("hidden");
    } else {
      content.classList.remove("show", "active");
      content.classList.add("hidden");
    }
  });
}

// Clean up chart resources
export function destroyCharts() {
  Object.values(charts).forEach((chart) => {
    if (chart) {
      chart.destroy();
    }
  });

  // Reset chart instances
  charts.temperature = null;
  charts.precipitation = null;
  charts.wind = null;
  charts.humidity = null;
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

// Map handling - Fixed to ensure proper English display and correct location
export function initMap(city) {
  const mapContainer = document.getElementById("mapContainer");
  if (!mapContainer) return;

  // Clear any existing map
  mapContainer.innerHTML = "";
  clearMapMarkers();

  // Initialize the map if not already
  if (!map) {
    map = L.map("mapContainer").setView([city.lat, city.lon], 10);

    // Add tile layer with language=en parameter to ensure English names
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      language: "en",
    }).addTo(map);
  } else {
    // Just update the view if map exists
    map.setView([city.lat, city.lon], 10);
  }

  // Add marker for the city with accurate coordinates
  const marker = L.marker([city.lat, city.lon]).addTo(map);

  // Add popup with city info
  marker.bindPopup(U.getMapPopupContent(city)).openPopup();

  // Add to markers array for later cleanup
  mapMarkers.push(marker);

  // Force map to update size (needed after modal opens)
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

export function addMapMarkers(cities) {
  if (!map) return;

  // Clear existing markers
  clearMapMarkers();

  // Add a marker for each city
  cities.forEach((city) => {
    const marker = L.marker([city.lat, city.lon]).addTo(map);
    marker.bindPopup(U.getMapPopupContent(city));
    mapMarkers.push(marker);
  });

  // Fit map to show all markers
  if (mapMarkers.length > 1) {
    const group = new L.featureGroup(mapMarkers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

export function clearMapMarkers() {
  if (!map) return;

  // Remove all markers from the map
  mapMarkers.forEach((marker) => {
    map.removeLayer(marker);
  });

  // Clear the markers array
  mapMarkers = [];
}
