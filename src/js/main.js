// Initializes the application and sets up event listeners

import { WeatherDashboard } from "./dashboard.js";
import * as Map from "./map.js";
import * as Charts from "./charts.js";

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

  // Register service worker
  registerServiceWorker();

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

      // Clean up charts when forecast modal is closed
      if (modalEl.id === "forecastModal") {
        Charts.destroyCharts();
      }

      // Clean up map when map modal is closed
      if (modalEl.id === "mapModal") {
        Map.clearMapMarkers();
      }
    });
  });

  // Initialize close buttons
  const closeButtons = document.querySelectorAll("[data-bs-dismiss='modal']");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.closest(".modal").id;
      const modal = bootstrap.Modal.getInstance(
        document.getElementById(modalId)
      );
      if (modal) {
        modal.hide();
      }
    });
  });
}

// Register service worker for offline functionality
function registerServiceWorker() {
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
}

// Handle offline/online status changes
window.addEventListener("online", handleConnectionChange);
window.addEventListener("offline", handleConnectionChange);

function handleConnectionChange(event) {
  const isOnline = navigator.onLine;

  const statusMessage = isOnline
    ? "You're back online! Refreshing weather data..."
    : "You're offline. Using cached weather data.";

  // Show toast message
  const toastEl = document.getElementById("weatherToast");
  const messageEl = document.getElementById("toastMessage");

  if (toastEl && messageEl) {
    messageEl.textContent = statusMessage;
    const bsToast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 5000,
    });
    bsToast.show();
  }

  // If back online, refresh data
  if (isOnline && window.weatherDashboard) {
    setTimeout(() => {
      window.weatherDashboard.refreshAll();
    }, 1000);
  }
}

// Enable dark/light theme toggle based on user preference
function setupThemeToggle() {
  const themeToggleBtn = document.getElementById("themeToggle");
  if (!themeToggleBtn) return;

  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("weatherDashboardTheme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set initial theme
  if (savedTheme === "light" || (!savedTheme && !prefersDark)) {
    document.body.classList.add("light-theme");
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Toggle theme on button click
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");

    // Update button icon
    themeToggleBtn.innerHTML = isLight
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';

    // Save preference
    localStorage.setItem("weatherDashboardTheme", isLight ? "light" : "dark");
  });
}

// Export key functions for global access if needed
export { initModals, registerServiceWorker, handleConnectionChange };
