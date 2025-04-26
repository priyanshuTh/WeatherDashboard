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

  // Initialize modal functionality
  initModals();

  // Service worker registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/serviceworker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((err) => console.error("SW registration failed:", err));
    });
  }

  console.log("WeatherDashboard initialized successfully");
});

// Initialize Bootstrap modals
function initModals() {
  // Ensure Bootstrap's modal backdrop works properly
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modalEl) => {
    modalEl.addEventListener("hidden.bs.modal", () => {
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());
    });
  });
}
