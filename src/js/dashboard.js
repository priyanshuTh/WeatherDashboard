import * as API from "./api.js";
import * as U from "./utils.js";
import * as UI from "./ui.js";

export class WeatherDashboard {
  constructor(gridEl) {
    // Main properties
    this.grid = gridEl;
    this.cities = [];
    this.recentSearches = [];

    // DOM elements
    this.loadingElement = document.querySelector(".loading-container");
    this.errorElement = document.querySelector(".error-message");
    this.searchInput = document.querySelector(".search-input");
    this.searchBtn = document.querySelector(".search-btn");
    this.refreshBtn = document.querySelector(".refresh-btn");
    this.recentSearchesList = document.getElementById("recentSearches");
    this.modal = document.getElementById("forecastModal");

    // Default cities to load if geolocation fails
    this.defaultCities = [
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "New York", lat: 40.7128, lon: -74.006 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
      { name: "Sydney", lat: -33.8688, lon: 151.2093 },
      { name: "Paris", lat: 48.8566, lon: 2.3522 },
    ];

    // Initialize the dashboard
    this.init();
  }

  // Initialize dashboard
  async init() {
    console.log("Initializing Weather Dashboard...");
    this.#showLoading();

    // Load recent searches from localStorage
    this.recentSearches = U.getFromLocalStorage("weatherRecentSearches", []);
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
      UI.showError(
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
          this.searchCity(event.target.value.trim());
        }
      });
    }

    // Search button click
    if (this.searchBtn) {
      this.searchBtn.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        if (query) {
          this.searchCity(query);
        }
      });
    }

    // Logo click refreshes all data
    const logoRefresh = document.getElementById("logoRefresh");
    if (logoRefresh) {
      logoRefresh.addEventListener("click", () => this.refreshAll());
    }

    // Refresh button
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener("click", () => this.refreshAll());
    }

    // Tab buttons in forecast modal
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    if (tabButtons.length > 0) {
      tabButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const tabTarget = event.target
            .getAttribute("data-bs-target")
            .replace("#", "")
            .replace("Tab", "");
          UI.switchTab(tabTarget);
        });
      });
    }
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
      // Get detailed city info from OpenWeather API
      const weatherData = await API.currentWeather(city.lat, city.lon);

      if (!weatherData) {
        console.error(`No weather data found for ${city.name}`);
        return null;
      }

      const countryCode = weatherData.sys.country.toLowerCase();
      const countryName = U.displayName(weatherData.sys.country);

      // Get a landmark image for the city
      const landmark = U.getLandmarkForCity(city.name);

      // Check if it's a capital city
      const isCapital = U.isCapitalCity(city.name, weatherData.sys.country);

      // Create a city object for our cities array
      const cityObject = {
        id: `${city.name.replace(/\s+/g, "-")}-${countryCode}`,
        name: city.name,
        country: countryName,
        countryCode: weatherData.sys.country,
        lat: city.lat,
        lon: city.lon,
        flag: `${U.flagBase}${countryCode}.svg`,
        landmark: landmark,
        isCapital: isCapital,
        weather: weatherData,
        sunrise: U.formatTime(
          weatherData.sys.sunrise * 1000,
          weatherData.timezone
        ),
        sunset: U.formatTime(
          weatherData.sys.sunset * 1000,
          weatherData.timezone
        ),
      };

      // Add to cities array if not already present
      const existingCityIndex = this.cities.findIndex(
        (c) =>
          c.name === cityObject.name && c.countryCode === cityObject.countryCode
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
        '<div class="no-results-message">No cities to display. Try searching for a city.</div>';
      return;
    }

    // Render each city
    this.cities.forEach((city) => {
      const card = UI.buildCityCard(city);
      card.addEventListener("click", () => this.#openForecast(city));
      this.grid.appendChild(card);
    });
  }

  // Render recent searches
  #renderRecentSearches() {
    UI.renderRecentSearches(this.recentSearches, this.recentSearchesList);

    // Add event listeners to recent items
    const recentItems =
      this.recentSearchesList.querySelectorAll(".recent-item");
    recentItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        const search = this.recentSearches[index];
        this.searchCity(search.name);
      });
    });
  }

  /* ------------ FORECAST METHODS ------------- */

  // Open forecast modal for a city
  async #openForecast(city) {
    try {
      // Show the modal with city name
      UI.showModal(city.name);

      // Fetch forecast data
      const forecastData = await API.forecast(city.lat, city.lon);

      if (!forecastData) {
        throw new Error("Could not load forecast data");
      }

      // Process data for charts
      const processedData = UI.processForecastData(forecastData);

      // Draw charts
      UI.drawTemperatureChart(processedData);
      UI.drawPrecipitationChart(processedData);
      UI.drawWindChart(processedData);

      // Render daily forecast cards
      UI.renderDailyForecast(processedData);

      // Show temperature tab by default
      UI.switchTab("temperature");
    } catch (err) {
      UI.showError("Could not load forecast. Please try again later.");
      console.error("Forecast error:", err);
    }
  }

  /* ------------ LOADING STATE METHODS ------------- */

  // Show loading indicator
  #showLoading() {
    UI.showLoading(this.grid);

    // Disable buttons during loading
    if (this.searchBtn) this.searchBtn.disabled = true;
    if (this.refreshBtn) this.refreshBtn.disabled = true;
  }

  // Hide loading indicator
  #hideLoading() {
    UI.hideLoading(this.grid);

    // Re-enable buttons
    if (this.searchBtn) this.searchBtn.disabled = false;
    if (this.refreshBtn) this.refreshBtn.disabled = false;
  }

  /* ------------ PUBLIC METHODS ------------- */

  // Search for a city
  async searchCity(query) {
    if (!query) return;

    try {
      this.#showLoading();

      // Get location data
      const geo = await API.geocode(query);

      if (!geo) {
        UI.showError(`City "${query}" not found. Please try another search.`);
        this.#hideLoading();
        return;
      }

      // Process and add the city
      const cityData = await this.#processCityData({
        name: geo.name,
        lat: geo.lat,
        lon: geo.lon,
      });

      if (cityData) {
        // Add to recent searches (if not already there)
        const exists = this.recentSearches.some(
          (item) =>
            item.name.toLowerCase() === cityData.name.toLowerCase() &&
            item.country === cityData.country
        );

        if (!exists) {
          // Add to beginning of array and keep only most recent 5
          this.recentSearches.unshift({
            name: cityData.name,
            country: cityData.country,
            lat: cityData.lat,
            lon: cityData.lon,
          });

          if (this.recentSearches.length > 5) {
            this.recentSearches.pop();
          }

          // Save to localStorage
          U.saveToLocalStorage("weatherRecentSearches", this.recentSearches);

          // Update UI
          this.#renderRecentSearches();
        }

        // Clear input
        if (this.searchInput) {
          this.searchInput.value = "";
        }

        // Re-render all cities
        this.#renderAllCities();
      }

      this.#hideLoading();
    } catch (error) {
      console.error("Search city error:", error);
      UI.showError(`Error searching for "${query}": ${error.message}`);
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
      this.refreshBtn.classList.add("rotate");
      setTimeout(() => this.refreshBtn.classList.remove("rotate"), 1000);
    }

    // Clear API cache
    API.clearCache();

    // Show toast notification
    UI.toast("Refreshing weather data...");

    // Reload everything
    await this.#loadInitialCities();
  }
}
