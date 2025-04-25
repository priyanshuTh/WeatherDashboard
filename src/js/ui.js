import * as U from "./utils.js";

// Chart instances
const charts = { temperature: null, precipitation: null, wind: null };

// Build a weather card for a city
export function buildCityCard(city) {
  const card = document.createElement("div");
  card.className = "weather-card";
  card.id = city.id;

  const data = city.weather;
  const icon = `${U.iconBase}${data.weather[0].icon}@2x.png`;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);

  card.innerHTML = /* html */ `
    <div class="landmark-container">
      <img src="${city.landmark}" class="landmark-image" alt="${city.name}" 
           onerror="this.src='${
             U.placeholderLandmark
           }';this.classList.add('error')">
      <div class="landmark-caption">
        <span>${city.name}</span>
      </div>
    </div>
    
    <div class="card-content">
      <div class="location-info">
        <div class="city-name">
          <h2>${city.name}</h2>
          ${city.isCapital ? '<span class="capital-badge">Capital</span>' : ""}
        </div>
        <img src="${city.flag}" class="mini-flag" alt="${city.country} flag" 
             onerror="this.src='${
               U.placeholderFlag
             }';this.classList.add('error')">
      </div>
      
      <div class="country-name">${city.country}</div>
      
      <div class="weather-main">
        <div class="temperature">
          ${temp}°C
          <img class="weather-icon" src="${icon}" alt="${
    data.weather[0].description
  }">
        </div>
        <div class="weather-description">
          ${data.weather[0].description}
        </div>
      </div>
      
      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-label">Feels Like</span>
          <span class="detail-value">${feelsLike}°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${data.main.humidity}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Wind</span>
          <span class="detail-value">${Math.round(data.wind.speed)} m/s</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Pressure</span>
          <span class="detail-value">${data.main.pressure} hPa</span>
        </div>
        
        <div class="sun-times">
          <div class="sunrise">
            <i class="fas fa-sun"></i>
            <span>${city.sunrise}</span>
          </div>
          <div class="sunset">
            <i class="fas fa-moon"></i>
            <span>${city.sunset}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return card;
}

// Loading and error displays
export function showLoading(gridElement) {
  const loadingEl = document.querySelector(".loading-container");
  if (loadingEl) loadingEl.style.display = "block";

  hideError();

  if (gridElement) {
    gridElement.style.opacity = "0.7";
    gridElement.style.pointerEvents = "none";
  }
}

export function hideLoading(gridElement) {
  const loadingEl = document.querySelector(".loading-container");
  if (loadingEl) loadingEl.style.display = "none";

  if (gridElement) {
    gridElement.style.opacity = "1";
    gridElement.style.pointerEvents = "auto";
  }
}

export function showError(message) {
  hideLoading();

  const errorEl = document.querySelector(".error-message");
  if (errorEl) {
    const errorTextEl = document.getElementById("errorText");
    if (errorTextEl) errorTextEl.textContent = message;
    errorEl.style.display = "block";
  }
}

export function hideError() {
  const errorEl = document.querySelector(".error-message");
  if (errorEl) errorEl.style.display = "none";
}

// Toast notification
export function toast(message) {
  const toastEl = document.getElementById("weatherToast");
  if (!toastEl) return;

  const messageEl = document.getElementById("toastMessage");
  if (messageEl) messageEl.textContent = message;

  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();
}

// Recent searches
export function renderRecentSearches(searches, container) {
  if (!container) return;

  container.innerHTML = "";

  if (!searches || searches.length === 0) {
    container.innerHTML = '<div class="no-recent">No recent searches</div>';
    return;
  }

  searches.forEach((search) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.innerHTML = `
      <i class="fas fa-history"></i>
      <span>${search.name}${search.country ? `, ${search.country}` : ""}</span>
    `;

    container.appendChild(item);
    return item;
  });
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
  const ctx = document.getElementById("temperatureChart").getContext("2d");
  charts.temperature = new Chart(ctx, {
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
  const ctx = document.getElementById("precipitationChart").getContext("2d");
  charts.precipitation = new Chart(ctx, {
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
  const ctx = document.getElementById("windChart").getContext("2d");
  charts.wind = new Chart(ctx, {
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
    dayCard.className = "daily-item";
    dayCard.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-date">${monthDay}</div>
      <img src="${U.iconBase}${day.icon}@2x.png" class="day-icon" alt="${day.weather.description}">
      <div class="day-temp">${day.temp}°C</div>
      <div class="day-desc">${day.weather.description}</div>
    `;

    dailyForecastElement.appendChild(dayCard);
  });
}

// Switch between tabs in the forecast modal
export function switchTab(tabName) {
  // Update active tab button
  const tabButtons = document.querySelectorAll(".nav-link");
  tabButtons.forEach((btn) => {
    if (btn.id === `${tabName}-tab`) {
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    }
  });

  // Update visible tab content
  const tabContents = document.querySelectorAll(".tab-pane");
  tabContents.forEach((content) => {
    if (content.id === `${tabName}Tab`) {
      content.classList.add("show", "active");
    } else {
      content.classList.remove("show", "active");
    }
  });
}

// Clean up chart resources
export function destroyCharts() {
  if (charts.temperature) {
    charts.temperature.destroy();
    charts.temperature = null;
  }

  if (charts.precipitation) {
    charts.precipitation.destroy();
    charts.precipitation = null;
  }

  if (charts.wind) {
    charts.wind.destroy();
    charts.wind = null;
  }
}

// Modal control
export function showModal(city) {
  const modalTitle = document.getElementById("forecastTitle");
  if (modalTitle) modalTitle.textContent = `${city} Weather Forecast`;

  const modalElement = document.getElementById("forecastModal");
  if (modalElement) {
    const bootstrapModal = new bootstrap.Modal(modalElement);
    bootstrapModal.show();
  }
}

export function hideModal() {
  const modalElement = document.getElementById("forecastModal");
  if (modalElement) {
    const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
  }
}
