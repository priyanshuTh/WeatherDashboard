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

  // toggle‐handler
  const toggleBtn = document.querySelector(".sidebar-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("show");
    });
  }

  //service worker registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("SW registration failed:", err));
    });
  }

  console.log("WeatherHub initialized successfully");
});
