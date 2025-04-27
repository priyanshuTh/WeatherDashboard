// Handles all chart creation and management functionality

// Chart instances
const charts = {
  temperature: null,
  precipitation: null,
  wind: null,
  humidity: null,
};

// Chart colors
function getChartColor(i) {
  const palette = [
    "rgba(59,130,246,1)", // Blue
    "rgba(139,92,246,1)", // Purple
    "rgba(236,72,153,1)", // Pink
    "rgba(34,197,94,1)", // Green
    "rgba(245,158,11,1)", // Amber
    "rgba(14,165,233,1)", // Sky
    "rgba(168,85,247,1)", // Violet
  ];
  return palette[i % palette.length];
}

// Chart background colors (with transparency)
function getChartColorAlpha(i, alpha = 0.7) {
  const palette = [
    `rgba(59,130,246,${alpha})`, // Blue
    `rgba(139,92,246,${alpha})`, // Purple
    `rgba(236,72,153,${alpha})`, // Pink
    `rgba(34,197,94,${alpha})`, // Green
    `rgba(245,158,11,${alpha})`, // Amber
    `rgba(14,165,233,${alpha})`, // Sky
    `rgba(168,85,247,${alpha})`, // Violet
  ];
  return palette[i % palette.length];
}

// Process forecast data for charts
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
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index),
      tension: 0.3,
      pointBackgroundColor: getChartColor(index),
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
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          titleFont: {
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            family: "'Inter', sans-serif",
          },
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
            font: {
              family: "'Inter', sans-serif",
              weight: "500",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
              weight: "500",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
            },
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
          borderRadius: 4,
          hoverBackgroundColor: "rgba(59, 130, 246, 0.9)",
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
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          titleFont: {
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            family: "'Inter', sans-serif",
          },
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
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Precipitation (mm)",
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
              weight: "500",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
            },
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
          borderRadius: 4,
          hoverBackgroundColor: "rgba(139, 92, 246, 0.9)",
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
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          titleFont: {
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            family: "'Inter', sans-serif",
          },
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
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Wind Speed (m/s)",
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
              weight: "500",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
            },
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
      borderColor: getChartColor(index),
      backgroundColor: getChartColor(index),
      tension: 0.3,
      pointBackgroundColor: getChartColor(index),
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
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          titleFont: {
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            family: "'Inter', sans-serif",
          },
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
            font: {
              family: "'Inter', sans-serif",
              weight: "500",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Humidity (%)",
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
              weight: "500",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              family: "'Inter', sans-serif",
            },
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
export function renderDailyForecast(data, iconBase) {
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
        <img src="${iconBase}${day.icon}@2x.png" class="w-12 h-12 mx-auto my-2" alt="${day.weather.description}">
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

export { getChartColor, getChartColorAlpha };
