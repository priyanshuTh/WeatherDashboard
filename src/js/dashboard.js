import * as API from "./api.js";
import * as UI from "./ui.js";
import * as Charts from "./charts.js";
import * as Map from "./map.js";
import * as F from "./formatting.js";
import * as L from "./landmarks.js";
import * as Storage from "./storage.js";
import * as Utils from "./utils.js";

export class WeatherDashboard {
  constructor(gridEl) {
    // Main properties
    this.grid = gridEl;
    this.cities = [];
    this.recentSearches = [];

    // DOM elements
    this.loadingElement = document.getElementById("loadingContainer");
    this.errorElement = document.getElementById("errorMessage");
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.refreshBtn = document.getElementById("logoRefresh");
    this.recentSearchesList = document.getElementById("recentSearches");
    this.sidebarToggle = document.getElementById("sidebarToggle");
    this.sidebar = document.getElementById("sidebar");

    // Default cities to load if geolocation fails
    this.defaultCities = [
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "New York", lat: 40.7128, lon: -74.006 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Paris", lat: 48.8566, lon: 2.3522 },
      { name: "Sydney", lat: -33.8688, lon: 151.2093 },
      { name: "Dubai", lat: 25.2048, lon: 55.2708 },
    ];

    // Initialize the dashboard
    this.init();
  }

  // Initialize dashboard
  async init() {
    console.log("Initializing Weather Dashboard...");
    this.#showLoading();

    // Load recent searches from localStorage
    this.recentSearches = Storage.getFromLocalStorage(
      "weatherRecentSearches",
      []
    );
    this.#renderRecentSearches();

    // Set up event listeners
    this.#setupEventListeners();

    // Load cities
    await this.#loadInitialCities();

    this.#hideLoading();
  }

  // Load initial cities
  async #loadInitialCities() {
    try {
      // Try to get user's location first
      const locationSuccess = await this.#getUserLocationAndCities();

      // If no cities were found, use default cities
      if (!locationSuccess || this.cities.length === 0) {
        await this.#fetchDefaultCities();
      }

      // Render the cities to the grid
      this.#renderAllCities();
    } catch (error) {
      console.error("Loading initial cities failed:", error);
      this.#showError(
        "Failed to load weather data. Please check your connection and try again."
      );

      // Try to load default cities as a fallback
      await this.#fetchDefaultCities();
      this.#renderAllCities();
    }
  }

  // Setup event listeners
  #setupEventListeners() {
    // Search with Enter key
    if (this.searchInput) {
      this.searchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter" && event.target.value.trim()) {
          this.searchLocation(event.target.value.trim());
        }
      });
    }

    // Search button click
    if (this.searchBtn) {
      this.searchBtn.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        if (query) {
          this.searchLocation(query);
        }
      });
    }

    // Logo click refreshes all data
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener("click", () => this.refreshAll());
    }

    // Sidebar toggle on mobile
    if (this.sidebarToggle && this.sidebar) {
      this.sidebarToggle.addEventListener("click", () => {
        this.sidebar.classList.toggle("open");

        // Toggle icon
        const icon = this.sidebarToggle.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-bars");
          icon.classList.toggle("fa-times");
        }
      });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      const isMobile = window.innerWidth < 992; // lg breakpoint
      if (
        isMobile &&
        this.sidebar &&
        this.sidebarToggle &&
        !this.sidebar.contains(e.target) &&
        !this.sidebarToggle.contains(e.target) &&
        this.sidebar.classList.contains("open")
      ) {
        this.sidebar.classList.remove("open");

        // Reset icon
        const icon = this.sidebarToggle.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-times");
        }
      }
    });

    // Tab buttons in forecast modal
    const tabButtons = document.querySelectorAll("[data-tab]");
    if (tabButtons.length > 0) {
      tabButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const tabTarget = event.currentTarget.getAttribute("data-tab");
          Charts.switchTab(tabTarget);
        });
      });
    }

    // Forecast event listener
    document.addEventListener("openForecast", (e) => {
      this.#openForecast(e.detail);
    });

    // Map event listener
    document.addEventListener("openMap", (e) => {
      this.#openMap(e.detail);
    });
  }

  /* ------------ CITY LOADING METHODS ------------- */

  // Try to get user location and nearby cities
  async #getUserLocationAndCities() {
    try {
      // Try to get user's location
      const position = await this.#getUserLocation();
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      // Get user's current city
      const userCity = await API.reverseGeocode(userLat, userLon);

      if (userCity) {
        // Add user's current city
        await this.#processCityData({
          name: userCity.name,
          lat: userLat,
          lon: userLon,
        });
      }

      // Find nearby cities
      await this.#findNearbyCities(userLat, userLon);

      return true;
    } catch (error) {
      console.warn("Could not get user location:", error);
      return false;
    }
  }

  // Get user's geolocation
  #getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  }

  // Find cities near a given location
  async #findNearbyCities(lat, lon) {
    try {
      const data = await API.findNearbyCities(lat, lon);

      if (data && data.list && data.list.length > 0) {
        const uniqueCities = new Map();

        // Filter out duplicates and get only unique cities
        data.list.forEach((city) => {
          if (!uniqueCities.has(city.name)) {
            uniqueCities.set(city.name, {
              lat: city.coord.lat,
              lon: city.coord.lon,
              name: city.name,
            });
          }
        });

        const citiesToFetch = Array.from(uniqueCities.values());

        // Process each city (up to 6)
        const promises = citiesToFetch
          .slice(0, 6)
          .map((city) => this.#processCityData(city));

        await Promise.allSettled(promises);
        return true;
      }
    } catch (error) {
      console.error("Finding nearby cities error:", error);
      return false;
    }
  }

  // Load default cities
  async #fetchDefaultCities() {
    try {
      const promises = this.defaultCities.map((city) =>
        this.#processCityData(city)
      );

      await Promise.allSettled(promises);
      return true;
    } catch (error) {
      console.error("Error fetching default cities:", error);
      return false;
    }
  }

  // Process city data and create city object
  async #processCityData(city) {
    try {
      // Skip if city has no valid coordinates
      if (!city.lat || !city.lon) {
        console.error(`Invalid coordinates for ${city.name}`);
        return null;
      }

      // Get detailed city info from OpenWeather API
      const weatherData = await API.currentWeather(city.lat, city.lon);

      if (!weatherData || !weatherData.sys || !weatherData.sys.country) {
        console.error(`No weather data found for ${city.name}`);
        return null;
      }

      const countryCode = weatherData.sys.country.toLowerCase();
      const countryName = F.displayName(weatherData.sys.country);

      // Get a landmark image for the city
      const landmark = L.getLandmarkForCity(city.name);

      // Check if it's a capital city
      const isCapital = L.isCapitalCity(city.name, weatherData.sys.country);

      // Create a city object for our cities array
      const cityObject = {
        id: `${city.name.replace(/\s+/g, "-")}-${countryCode}`,
        name: city.name,
        country: countryName,
        countryCode: weatherData.sys.country,
        lat: city.lat,
        lon: city.lon,
        flag: `${L.flagBase}${countryCode}.svg`,
        landmark: landmark,
        isCapital: isCapital,
        weather: weatherData,
        sunrise: F.formatTime(
          weatherData.sys.sunrise * 1000,
          weatherData.timezone
        ),
        sunset: F.formatTime(
          weatherData.sys.sunset * 1000,
          weatherData.timezone
        ),
      };

      // Add to cities array if not already present
      const existingCityIndex = this.cities.findIndex(
        (c) =>
          c &&
          c.name === cityObject.name &&
          c.countryCode === cityObject.countryCode
      );

      if (existingCityIndex === -1) {
        this.cities.push(cityObject);
      } else {
        // Update existing city
        this.cities[existingCityIndex] = cityObject;
      }

      return cityObject;
    } catch (error) {
      console.error(`Error processing data for ${city.name}:`, error);
      return null;
    }
  }

  /* ------------ UI RENDERING METHODS ------------- */

  // Render all cities to the grid
  #renderAllCities() {
    // Clear the grid first
    this.grid.innerHTML = "";

    if (this.cities.length === 0) {
      this.grid.innerHTML =
        '<div class="col-span-full text-center py-10 text-text-secondary italic">No cities to display. Try searching for a city.</div>';
      return;
    }

    // Render each city with animation delay
    this.cities.forEach((city, index) => {
      if (!city) return; // Skip null/undefined cities

      const card = UI.buildCityCard(city);

      // Add animation delay
      card.style.animationDelay = `${index * 0.1}s`;

      // Add click handler for the card itself
      card.addEventListener("click", () => this.#openForecast(city));

      // Add card to grid
      this.grid.appendChild(card);
    });
  }

  // Render recent searches
  #renderRecentSearches() {
    // Get the recent searches container
    const container = this.recentSearchesList;
    if (!container) return;

    // Clear the container first
    container.innerHTML = "";

    // If no recent searches, show message
    if (!this.recentSearches || this.recentSearches.length === 0) {
      container.innerHTML =
        '<div class="text-center italic text-text-secondary p-4">No recent searches</div>';
      return;
    }

    // Render each recent search
    this.recentSearches.forEach((search, index) => {
      const item = document.createElement("div");
      item.className =
        "flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-accent-blue/10 hover:-translate-y-1";

      // Create the content (city name, country)
      const content = document.createElement("div");
      content.className = "flex items-center gap-2 flex-grow";
      content.innerHTML = `
        <i class="fas fa-history text-accent-blue"></i>
        <span>${search.name}${
        search.country ? `, ${search.country}` : ""
      }</span>
      `;

      // Create the delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "p-1.5 rounded-full text-text-secondary hover:text-error hover:bg-error/10 transition-colors";
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';

      // Add event listeners
      content.addEventListener("click", () => {
        this.searchLocation(search.name);
      });

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the parent click event
        this.#removeRecentSearch(index);
      });

      // Append elements to the item
      item.appendChild(content);
      item.appendChild(deleteBtn);

      // Add the item to the container
      container.appendChild(item);
    });
  }

  // Remove a recent search by index
  #removeRecentSearch(index) {
    if (index >= 0 && index < this.recentSearches.length) {
      const removed = this.recentSearches.splice(index, 1)[0];
      Storage.saveToLocalStorage("weatherRecentSearches", this.recentSearches);
      this.#renderRecentSearches();
      UI.toast(`Removed "${removed.name}" from recent searches`);
    }
  }

  /* ------------ FORECAST & MAP METHODS ------------- */

  // Open forecast modal for a city
  async #openForecast(city) {
    try {
      // Show the modal with city name
      UI.showModal("forecastModal", `${city.name} Weather Forecast`);

      // Fetch forecast data
      const forecastData = await API.forecast(city.lat, city.lon);

      if (!forecastData) {
        throw new Error("Could not load forecast data");
      }

      // Process data for charts
      const processedData = Charts.processForecastData(forecastData);

      // Draw charts
      Charts.drawTemperatureChart(processedData);
      Charts.drawPrecipitationChart(processedData);
      Charts.drawWindChart(processedData);
      Charts.drawHumidityChart(processedData);

      // Render daily forecast cards
      Charts.renderDailyForecast(processedData, L.iconBase);

      // Show temperature tab by default
      Charts.switchTab("temperatureTab");
    } catch (err) {
      this.#showError("Could not load forecast. Please try again later.");
      console.error("Forecast error:", err);
    }
  }

  // Open map modal for a city
  #openMap(city) {
    try {
      // Show the map modal
      UI.showModal("mapModal", `${city.name} Location Map`);

      // Initialize the map with the city location
      setTimeout(() => {
        Map.initMap(city);
      }, 300);
    } catch (err) {
      this.#showError("Could not load map. Please try again later.");
      console.error("Map error:", err);
    }
  }

  /* ------------ LOADING STATE METHODS ------------- */

  // Show loading indicator
  #showLoading() {
    if (this.loadingElement) {
      this.loadingElement.classList.remove("hidden");
    }

    if (this.grid) {
      this.grid.style.opacity = "0.5";
      this.grid.style.pointerEvents = "none";
    }

    // Disable buttons during loading
    if (this.searchBtn) this.searchBtn.disabled = true;
    if (this.refreshBtn) this.refreshBtn.style.pointerEvents = "none";
  }

  // Hide loading indicator
  #hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.classList.add("hidden");
    }

    if (this.grid) {
      this.grid.style.opacity = "1";
      this.grid.style.pointerEvents = "auto";
    }

    // Re-enable buttons
    if (this.searchBtn) this.searchBtn.disabled = false;
    if (this.refreshBtn) this.refreshBtn.style.pointerEvents = "auto";
  }

  // Show error message
  #showError(message) {
    this.#hideLoading();

    if (this.errorElement) {
      const errorTextEl = document.getElementById("errorText");
      if (errorTextEl) errorTextEl.textContent = message;

      this.errorElement.classList.remove("hidden");

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        this.errorElement.classList.add("hidden");
      }, 5000);
    } else {
      // Fallback to toast if error element not found
      UI.toast(message);
    }
  }

  /* ------------ PUBLIC METHODS ------------- */

  // Simplified search method that detects the type automatically
  async searchLocation(query) {
    if (!query) return;

    try {
      this.#showLoading();

      // Clear previous cities before a new search
      this.cities = [];

      // Get geocoding data
      const geoResults = await API.geocode(query);

      if (!geoResults || geoResults.length === 0) {
        this.#showError(
          `Location "${query}" not found. Please try another search.`
        );
        this.#hideLoading();
        return;
      }

      // Process up to 3 results from the search
      const citiesToProcess = geoResults.slice(0, 3);
      console.log("Processing cities:", citiesToProcess);

      const promises = citiesToProcess.map((geo) =>
        this.#processCityData({
          name: geo.name,
          lat: geo.lat,
          lon: geo.lon,
        })
      );

      const results = await Promise.allSettled(promises);
      const processedCities = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);

      // If we processed any cities successfully
      if (processedCities.length > 0) {
        // Add to recent searches if not already there
        const search = {
          name: query,
          lat: processedCities[0].lat,
          lon: processedCities[0].lon,
          country: processedCities[0].country,
        };

        const exists = this.recentSearches.some(
          (item) => item.name.toLowerCase() === search.name.toLowerCase()
        );

        if (!exists) {
          // Add to beginning of array and keep only most recent 5
          this.recentSearches.unshift(search);

          if (this.recentSearches.length > 5) {
            this.recentSearches.pop();
          }

          // Save to localStorage
          Storage.saveToLocalStorage(
            "weatherRecentSearches",
            this.recentSearches
          );

          // Update UI
          this.#renderRecentSearches();
        }

        // Clear input
        if (this.searchInput) {
          this.searchInput.value = "";
        }

        // Re-render all cities
        this.#renderAllCities();

        // Show a toast notification
        UI.toast(
          `Weather for ${processedCities.length} location(s) loaded successfully`
        );
      }

      this.#hideLoading();
    } catch (error) {
      console.error("Search location error:", error);
      this.#showError(`Error searching for "${query}": ${error.message}`);
      this.#hideLoading();
    }
  }

  // Refresh all data
  async refreshAll() {
    // Clear and prepare UI
    this.grid.innerHTML = "";
    this.cities = [];

    // Show visual feedback on refresh button
    if (this.refreshBtn) {
      const icon = this.refreshBtn.querySelector("i");
      if (icon) {
        icon.classList.add("fa-spin");
        setTimeout(() => icon.classList.remove("fa-spin"), 1000);
      }
    }

    // Clear API cache
    API.clearCache();

    // Show toast notification
    UI.toast("Refreshing weather data...");

    // Show loading
    this.#showLoading();

    // Reload everything
    await this.#loadInitialCities();

    // Hide loading
    this.#hideLoading();
  }
}
