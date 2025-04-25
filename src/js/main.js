import { WeatherDashboard } from "./dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("weatherGrid");

  if (!grid) {
    console.error("Error: Weather grid element not found!");
    return;
  }

  // Initialize the dashboard
  const dashboard = new WeatherDashboard(grid);

  // Make dashboard accessible for debugging if needed
  window.weatherDashboard = dashboard;

  console.log("WeatherHub initialized successfully");
});
