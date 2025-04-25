class WeatherDashboard {
  constructor() {
    this.apiKey = "b07b35f2f6d90022405686bf331d890e"; // Replace with your actual API key
    this.timeZones = []; // Will be populated automatically based on user's location
    this.weatherCache = new Map();
    this.cacheDuration = 300000; // 5 minutes
    this.flagBaseUrl = "https://flagcdn.com/w80/";
    this.intervals = [];
    this.pollutionCache = new Map();
    this.loadingElement = document.querySelector(".loading-message");
    this.weatherGrid = document.getElementById("weatherGrid");
    this.placeholderImageFlag =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0MzY0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiI+RmxhZyBJbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";
    this.placeholderImageLandmark =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0MzY0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI2ZmZiI+TGFuZG1hcmsgSW1hZ2UgVW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+";

    // Popular cities to start with if geolocation fails
    this.fallbackCities = [
      { lat: 51.5074, lon: -0.1278, name: "London" }, // London
      { lat: 40.7128, lon: -74.006, name: "New York" }, // New York
      { lat: 35.6762, lon: 139.6503, name: "Tokyo" }, // Tokyo
      { lat: 19.4326, lon: -99.1332, name: "Mexico City" }, // Mexico City
      { lat: -33.8688, lon: 151.2093, name: "Sydney" }, // Sydney
    ];

    this.initialize();
  }

  async initialize() {
    try {
      console.log("Initializing Weather Dashboard...");

      // Check if API key is valid
      if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
        throw new Error(
          "Invalid or missing API key. Please provide a valid OpenWeather API key."
        );
      }

      // Check if required DOM elements exist
      if (!this.weatherGrid || !this.loadingElement) {
        throw new Error(
          "Required DOM elements not found. Check your HTML structure."
        );
      }

      this.setLoadingState(true);
      this.setupEventListeners();

      // Get user's location and fetch nearby cities
      await this.getUserLocationAndCities();

      // If no cities were found, use fallback cities
      if (this.timeZones.length === 0) {
        await this.fetchCityDataByCoordinates(this.fallbackCities);
      }

      await this.displayWeatherCards(this.timeZones);
      this.setLoadingState(false);
      this.startUpdateCycles();
    } catch (error) {
      console.error("Initialization failed:", error);
      this.setLoadingState(false);
      this.showError(
        error.message ||
          "Failed to initialize the Weather Dashboard. Please try again later."
      );
    }
  }

  async getUserLocationAndCities() {
    try {
      // Try to get user's location
      const position = await this.getUserLocation();
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      // Get user's current city
      const userCity = await this.reverseGeocode(userLat, userLon);

      // Find nearby cities
      await this.findNearbyCities(userLat, userLon);

      console.log(`User location: ${userCity || "Unknown"}`);
    } catch (error) {
      console.warn("Could not get user location:", error);
      console.log("Using fallback cities...");
      await this.fetchCityDataByCoordinates(this.fallbackCities);
    }
  }

  getUserLocation() {
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

  async reverseGeocode(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return data[0].name;
      }

      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  }

  async findNearbyCities(lat, lon) {
    try {
      // Use the find cities within circle API endpoint
      const radius = 500000; // 500km radius
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=15&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to find nearby cities");
      }

      const data = await response.json();

      if (data && data.list && data.list.length > 0) {
        const citiesToFetch = data.list.map((city) => ({
          lat: city.coord.lat,
          lon: city.coord.lon,
          name: city.name,
        }));

        await this.fetchCityDataByCoordinates(citiesToFetch);
      } else {
        throw new Error("No nearby cities found");
      }
    } catch (error) {
      console.error("Finding nearby cities error:", error);
      throw error;
    }
  }

  async fetchCityDataByCoordinates(cities) {
    try {
      for (const city of cities) {
        try {
          // Get detailed city info from OpenWeather API
          const weatherData = await this.getWeatherData(city);
          const countryCode = weatherData.sys.country.toLowerCase();

          // Get timezone from API
          const tzResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${city.lat}&lon=${city.lon}&exclude=minutely,hourly,daily,alerts&appid=${this.apiKey}`
          );
          const tzData = await tzResponse.json();

          // Create a city object for our timeZones array
          const cityObject = {
            zone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default timezone, will be updated with accurate data
            name: city.name,
            country:
              this.getCountryName(weatherData.sys.country) ||
              weatherData.sys.country,
            lat: city.lat,
            lon: city.lon,
            icon: this.getIconForCity(city.name),
            flag: `https://flagcdn.com/${countryCode}.svg`,
            landmark:
              this.getLandmarkForCity(city.name, weatherData.sys.country) ||
              this.placeholderImageLandmark,
            landmarkName: `${city.name} Landmark`,
            capitalCity: await this.isCapitalCity(
              city.name,
              weatherData.sys.country
            ),
            description: `City in ${
              this.getCountryName(weatherData.sys.country) ||
              weatherData.sys.country
            }`,
            attractions: [],
            weatherInfo: {
              climate: this.getClimateType(weatherData),
              bestTimeToVisit: this.determineBestTimeToVisit(
                weatherData.sys.country,
                city.lat
              ),
              averageTemp: {
                summer: `${Math.round(weatherData.main.temp + 10)}°C`,
                winter: `${Math.round(weatherData.main.temp - 10)}°C`,
              },
            },
          };

          // Update timezone if available
          if (tzData && tzData.timezone) {
            cityObject.zone = tzData.timezone;
          }

          // Add to timeZones array
          this.timeZones.push(cityObject);
        } catch (cityError) {
          console.error(`Error fetching data for ${city.name}:`, cityError);
        }
      }
    } catch (error) {
      console.error("Error processing cities:", error);
      throw error;
    }
  }

  // Helper methods for city data
  getIconForCity(cityName) {
    const icons = [
      "fa-building",
      "fa-city",
      "fa-landmark",
      "fa-monument",
      "fa-mountain",
      "fa-tree",
      "fa-water",
    ];
    // Use hash of city name to pick a consistent icon
    const hash = cityName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return icons[hash % icons.length];
  }

  getLandmarkForCity(cityName, countryCode) {
    // In a real app, you'd have an API for this or a database
    // This is a placeholder implementation
    return this.placeholderImageLandmark;
  }

  async isCapitalCity(cityName, countryCode) {
    // In a real app, you'd check against a database or API
    // This is a simplified implementation for demo purposes
    const commonCapitals = {
      London: "GB",
      Paris: "FR",
      Berlin: "DE",
      "Washington D.C.": "US",
      Beijing: "CN",
      Tokyo: "JP",
      Moscow: "RU",
      Rome: "IT",
      Madrid: "ES",
      Ottawa: "CA",
      Brasília: "BR",
      Canberra: "AU",
      "New Delhi": "IN",
    };

    return commonCapitals[cityName] === countryCode;
  }

  getCountryName(countryCode) {
    // Convert country code to full name
    try {
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      return regionNames.of(countryCode);
    } catch (error) {
      console.warn(`Could not get country name for ${countryCode}:`, error);
      return countryCode;
    }
  }

  getClimateType(weatherData) {
    // Simplified climate determination based on temperature and humidity
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;

    if (temp > 30) {
      return humidity > 70 ? "Tropical" : "Hot desert";
    } else if (temp > 20) {
      return humidity > 60 ? "Humid subtropical" : "Mediterranean";
    } else if (temp > 10) {
      return humidity > 60 ? "Oceanic" : "Temperate";
    } else if (temp > 0) {
      return "Continental";
    } else {
      return "Polar";
    }
  }

  determineBestTimeToVisit(countryCode, latitude) {
    // Simplified determination based on hemisphere and latitude
    const northernHemisphere = latitude > 0;

    if (Math.abs(latitude) > 50) {
      // High latitudes
      return northernHemisphere ? "June to August" : "December to February";
    } else if (Math.abs(latitude) > 30) {
      // Mid latitudes
      return northernHemisphere ? "April to October" : "October to April";
    } else {
      // Tropics
      return northernHemisphere ? "November to March" : "May to September";
    }
  }

  setupEventListeners() {
    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.addEventListener("input", this.handleSearch.bind(this));

      // Add "Search by city" placeholder
      searchInput.placeholder = "Search by city or country...";
    }

    // Add event listener for the "Add City" button
    const addCityBtn = document.querySelector(".add-city-btn");
    if (addCityBtn) {
      addCityBtn.addEventListener("click", this.showAddCityModal.bind(this));
    } else {
      // Create the button if it doesn't exist
      this.createAddCityButton();
    }

    // Add refresh button
    this.createRefreshButton();

    // Also populate location list in sidebar
    this.populateLocationList();
  }

  createAddCityButton() {
    const header =
      document.querySelector("header") ||
      document.querySelector(".dashboard-header");
    if (!header) return;

    const addButton = document.createElement("button");
    addButton.className = "add-city-btn";
    addButton.innerHTML = '<i class="fas fa-plus"></i> Add City';
    addButton.addEventListener("click", this.showAddCityModal.bind(this));

    header.appendChild(addButton);
  }

  createRefreshButton() {
    const header =
      document.querySelector("header") ||
      document.querySelector(".dashboard-header");
    if (!header) return;

    const refreshButton = document.createElement("button");
    refreshButton.className = "refresh-btn";
    refreshButton.innerHTML = '<i class="fas fa-sync"></i>';
    refreshButton.title = "Refresh weather data";
    refreshButton.addEventListener("click", this.refreshAllWeather.bind(this));

    header.appendChild(refreshButton);
  }

  showAddCityModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById("add-city-modal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "add-city-modal";
      modal.className = "modal";
      modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Add City</h2>
                    <input type="text" id="city-search" placeholder="Enter city name...">
                    <div id="city-search-results"></div>
                    <button id="search-city-btn">Search</button>
                </div>
            `;
      document.body.appendChild(modal);

      // Add event listeners
      const closeBtn = modal.querySelector(".close-modal");
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });

      const searchBtn = modal.querySelector("#search-city-btn");
      searchBtn.addEventListener("click", this.searchCity.bind(this));

      const cityInput = modal.querySelector("#city-search");
      cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.searchCity();
        }
      });
    }

    // Show modal
    modal.style.display = "block";
  }

  async searchCity() {
    const cityInput = document.getElementById("city-search");
    const resultsContainer = document.getElementById("city-search-results");

    if (!cityInput || !cityInput.value.trim()) {
      resultsContainer.innerHTML =
        '<div class="search-error">Please enter a city name</div>';
      return;
    }

    try {
      resultsContainer.innerHTML = '<div class="searching">Searching...</div>';

      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          cityInput.value
        )}&limit=5&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error("City search failed");
      }

      const cities = await response.json();

      if (cities.length === 0) {
        resultsContainer.innerHTML =
          '<div class="search-error">No cities found</div>';
        return;
      }

      // Display results
      resultsContainer.innerHTML = "";
      cities.forEach((city) => {
        const resultItem = document.createElement("div");
        resultItem.className = "city-result";
        resultItem.innerHTML = `
                    <div>${city.name}, ${city.state || ""}</div>
                    <div class="country">${city.country}</div>
                `;
        resultItem.addEventListener("click", () => {
          this.addCityToList(city);
          document.getElementById("add-city-modal").style.display = "none";
        });
        resultsContainer.appendChild(resultItem);
      });
    } catch (error) {
      console.error("City search error:", error);
      resultsContainer.innerHTML = `<div class="search-error">Error: ${error.message}</div>`;
    }
  }

  async addCityToList(city) {
    try {
      const newCity = {
        lat: city.lat,
        lon: city.lon,
        name: city.name,
      };

      // Create city object with all needed data
      await this.fetchCityDataByCoordinates([newCity]);

      // Update UI
      this.populateLocationList();

      // Show the new city
      const addedCity = this.timeZones.find(
        (tz) =>
          tz.name === city.name &&
          Math.abs(tz.lat - city.lat) < 0.01 &&
          Math.abs(tz.lon - city.lon) < 0.01
      );

      if (addedCity) {
        await this.displayWeatherCards([addedCity]);
      }
    } catch (error) {
      console.error("Error adding city:", error);
      this.showError("Failed to add city. Please try again.");
    }
  }

  populateLocationList() {
    const locationList = document.querySelector(".location-list");
    if (!locationList) return;

    locationList.innerHTML = "";

    this.timeZones.forEach((location) => {
      const listItem = document.createElement("div");
      listItem.className = "location-item";
      listItem.innerHTML = `
                <img src="${location.flag}" alt="${location.country} flag" class="mini-flag">
                <span>${location.name}, ${location.country}</span>
            `;
      listItem.addEventListener("click", () => {
        document.querySelector(".search-input").value = location.name;
        this.displayWeatherCards([location]);
      });
      locationList.appendChild(listItem);
    });
  }

  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    if (!searchTerm) {
      this.displayWeatherCards(this.timeZones);
      return;
    }

    // Filter locations based on search term
    const filteredLocations = this.timeZones.filter((location) => {
      return (
        location.name.toLowerCase().includes(searchTerm) ||
        location.country.toLowerCase().includes(searchTerm)
      );
    });

    // Update the UI with filtered locations
    this.displayWeatherCards(filteredLocations);
  }

  async displayWeatherCards(locations) {
    const grid = document.getElementById("weatherGrid");
    grid.innerHTML = "";

    if (!locations || locations.length === 0) {
      grid.innerHTML =
        '<div class="no-results-message">No locations found matching your search.</div>';
      return;
    }

    for (const location of locations) {
      try {
        const weatherData = await this.getWeatherData(location);
        if (this.validateWeatherData(weatherData)) {
          const card = await this.createWeatherCard(location, weatherData);
          grid.appendChild(card);
        } else {
          throw new Error("Invalid weather data structure");
        }
      } catch (error) {
        console.error(`Error generating card for ${location.name}:`, error);
        const errorCard = this.createErrorCard(location);
        grid.appendChild(errorCard);
      }
    }
  }

  startUpdateCycles() {
    // Clear any existing intervals first
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    // Set new intervals
    this.intervals.push(
      setInterval(() => this.updateAllTimes(), 60000), // Update times every minute
      setInterval(() => this.updateAllWeather(), 300000), // Update weather every 5 minutes
      setInterval(() => this.cleanCache(), 600000) // Clean cache every 10 minutes
    );
  }

  refreshAllWeather() {
    // Clear cache first to force refresh
    this.weatherCache.clear();
    this.pollutionCache.clear();

    // Update weather for displayed cards
    this.updateAllWeather();

    // Show refresh animation
    const refreshBtn = document.querySelector(".refresh-btn");
    if (refreshBtn) {
      refreshBtn.classList.add("rotate");
      setTimeout(() => {
        refreshBtn.classList.remove("rotate");
      }, 1000);
    }
  }

  updateAllTimes() {
    for (const location of this.timeZones) {
      const cardId = `card-${location.zone.replace("/", "-")}`;
      const card = document.getElementById(cardId);

      if (card) {
        const datetimeElement = card.querySelector(".datetime");
        if (datetimeElement) {
          datetimeElement.textContent = this.getLocalTime(location.zone);
        }
      }
    }
  }

  async updateAllWeather() {
    // Only update cards that are currently visible
    for (const location of this.timeZones) {
      const cardId = `card-${location.zone.replace("/", "-")}`;
      const card = document.getElementById(cardId);

      if (card) {
        try {
          // Force refresh by setting a low cacheDuration value temporarily
          const oldCacheDuration = this.cacheDuration;
          this.cacheDuration = 0;

          const weatherData = await this.getWeatherData(location);

          // Restore cache duration
          this.cacheDuration = oldCacheDuration;

          if (this.validateWeatherData(weatherData)) {
            this.updateWeatherCard(card, location, weatherData);
          }
        } catch (error) {
          console.error(`Error updating weather for ${location.name}:`, error);
        }
      }
    }
  }

  async updateWeatherCard(card, location, weatherData) {
    if (!card || !weatherData) return;

    const temp = Math.round(weatherData.main.temp);
    const weather = weatherData.weather[0];
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed);
    const feelsLike = Math.round(weatherData.main.feels_like);

    // Update temperature and weather icon
    const temperatureElement = card.querySelector(".temperature");
    if (temperatureElement) {
      temperatureElement.innerHTML = `
                ${temp}°C
                <img class="weather-icon" 
                     src="https://openweathermap.org/img/wn/${
                       weather.icon
                     }@2x.png" 
                     alt="${weather.description}"
                     style="${
                       weather.icon.includes("01")
                         ? "filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))"
                         : ""
                     }">
            `;
    }

    // Update weather description
    const descriptionElement = card.querySelector(".weather-description");
    if (descriptionElement) {
      descriptionElement.textContent = weather.description;
    }

    // Update time
    const datetimeElement = card.querySelector(".datetime");
    if (datetimeElement) {
      datetimeElement.textContent = this.getLocalTime(location.zone);
    }

    // Update weather details
    const detailItems = card.querySelectorAll(".detail-item");
    if (detailItems.length >= 4) {
      // Feels like
      detailItems[0].querySelector(
        ".detail-value"
      ).textContent = `${feelsLike}°C`;
      // Humidity
      detailItems[1].querySelector(
        ".detail-value"
      ).textContent = `${humidity}%`;
      // Wind
      detailItems[2].querySelector(
        ".detail-value"
      ).textContent = `${windSpeed} m/s`;
      // Pressure
      detailItems[3].querySelector(
        ".detail-value"
      ).textContent = `${weatherData.main.pressure} hPa`;
    }

    // Update pollution data if exists
    try {
      const pollutionData = await this.getPollutionData(location);
      if (
        pollutionData &&
        pollutionData.list &&
        pollutionData.list.length > 0
      ) {
        const aqi = pollutionData.list[0].main.aqi;
        const aqiText = this.getAQIText(aqi);
        const aqiClass = this.getAQIClass(aqi);

        let pollutionElement = card.querySelector(".pollution-info");
        if (!pollutionElement) {
          pollutionElement = document.createElement("div");
          pollutionElement.className = "pollution-info";
          card.querySelector(".card-content").appendChild(pollutionElement);
        }

        pollutionElement.innerHTML = `
                    <div class="aqi-indicator ${aqiClass}">
                        <span class="aqi-label">Air Quality:</span>
                        <span class="aqi-value">${aqiText}</span>
                    </div>
                `;
      }
    } catch (error) {
      console.error("Failed to update pollution data:", error);
    }

    // Add a subtle animation to show the card has been updated
    card.classList.add("update-flash");
    setTimeout(() => {
      card.classList.remove("update-flash");
    }, 1000);
  }

  async getWeatherData(location) {
    const cacheKey = `${location.lat},${location.lon}`;
    const cached = this.weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`Using cached weather data for ${location.name}`);
      return cached.data;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric`;
    console.log(`Fetching weather data for ${location.name}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(`Weather API error: ${errorData.message}`);
      }

      const data = await response.json();

      // Cache the data
      this.weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(
        `Failed to fetch weather data for ${location.name}:`,
        error
      );
      throw error;
    }
  }

  async getPollutionData(location) {
    const cacheKey = `${location.lat},${location.lon}`;
    const cached = this.pollutionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch pollution data");
      }

      const data = await response.json();

      // Cache the data
      this.pollutionCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(
        `Failed to fetch pollution data for ${location.name}:`,
        error
      );
      throw error;
    }
  }

  getAQIText(aqi) {
    if (aqi === null || aqi === undefined) return "Unknown";

    const aqiTexts = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

    return aqiTexts[aqi - 1] || "Unknown";
  }

  getAQIClass(aqi) {
    if (aqi === null || aqi === undefined) return "aqi-unknown";

    const aqiClasses = [
      "aqi-good",
      "aqi-fair",
      "aqi-moderate",
      "aqi-poor",
      "aqi-very-poor",
    ];

    return aqiClasses[aqi - 1] || "aqi-unknown";
  }

  validateWeatherData(data) {
    return (
      data &&
      data.main &&
      typeof data.main.temp === "number" &&
      Array.isArray(data.weather) &&
      data.weather.length > 0 &&
      data.weather[0].description &&
      data.weather[0].icon
    );
  }

  async createWeatherCard(location, weatherData) {
    const card = document.createElement("div");
    card.className = "weather-card animate-in";
    card.id = `card-${location.zone.replace("/", "-")}`;

    card.innerHTML = await this.generateCardHTML(location, weatherData);

    // Set up image error handlers
    const flagImg = card.querySelector(".country-flag");
    if (flagImg) {
      flagImg.onerror = () => {
        flagImg.src = this.placeholderImageFlag;
        flagImg.classList.add("error");
      };
    }

    const landmarkImg = card.querySelector(".landmark-image");
    if (landmarkImg) {
      landmarkImg.onerror = () => {
        landmarkImg.src = this.placeholderImageLandmark;
      };
    }

    // Add remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-card-btn";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Remove city";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeCity(location);
      card.classList.add("animate-out");
      setTimeout(() => {
        card.remove();
      }, 300);
    });
    card.appendChild(removeBtn);

    return card;
  }

  removeCity(location) {
    // Remove from timeZones array
    const index = this.timeZones.findIndex(
      (tz) =>
        tz.name === location.name &&
        tz.lat === location.lat &&
        tz.lon === location.lon
    );

    if (index !== -1) {
      this.timeZones.splice(index, 1);
      this.populateLocationList();
    }
  }

  createErrorCard(location) {
    const card = document.createElement("div");
    card.className = "weather-card error-card";
    card.id = `card-${
      location.zone ? location.zone.replace("/", "-") : "unknown"
    }-error`;

    card.innerHTML = `
            <div class="card-content">
                <div class="location-header">
                    <img src="${location.flag || this.placeholderImageFlag}" 
                         alt="${location.country || "Unknown"} flag" 
                         class="country-flag">
                    <div class="location-info">
                        <h2>${location.name || "Unknown Location"}</h2>
                        <span class="country-name">${
                          location.country || "Unknown Country"
                        }</span>
                    </div>
                </div>
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Weather data unavailable</p>
                    <button class="retry-btn">Retry</button>
                </div>
            </div>
        `;

    // Add retry button functionality
    const retryBtn = card.querySelector(".retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", async () => {
        try {
          const cardContainer = retryBtn.closest(".weather-card");
          cardContainer.classList.add("loading");

          // Clear cache for this location
          const cacheKey = `${location.lat},${location.lon}`;
          this.weatherCache.delete(cacheKey);

          // Try to fetch new data
          const weatherData = await this.getWeatherData(location);

          if (this.validateWeatherData(weatherData)) {
            const newCard = await this.createWeatherCard(location, weatherData);

            // Replace old card with new one
            cardContainer.parentNode.replaceChild(newCard, cardContainer);
          } else {
            throw new Error("Weather data still invalid");
          }
        } catch (error) {
          console.error("Retry failed:", error);
          const cardContainer = retryBtn.closest(".weather-card");
          cardContainer.classList.remove("loading");

          // Show temporary error message
          const errorMsg = card.querySelector(".error-message p");
          const originalText = errorMsg.textContent;
          errorMsg.textContent = "Retry failed. Try again later.";

          setTimeout(() => {
            errorMsg.textContent = originalText;
          }, 3000);
        }
      });
    }

    return card;
  }

  async generateCardHTML(location, weatherData) {
    const temp = Math.round(weatherData.main.temp);
    const weather = weatherData.weather[0];
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed);
    const pressure = weatherData.main.pressure;
    const feelsLike = Math.round(weatherData.main.feels_like);

    // Format current time for location
    const localTime = this.getLocalTime(location.zone);

    // Fetch pollution data
    let pollutionData;
    try {
      pollutionData = await this.getPollutionData(location);
    } catch (error) {
      console.error("Failed to fetch pollution data:", error);
    }

    const aqi = pollutionData?.list?.[0]?.main?.aqi || null;
    const aqiText = this.getAQIText(aqi);
    const aqiClass = this.getAQIClass(aqi);

    // Get sunrise and sunset times if available
    let sunrise = "";
    let sunset = "";

    if (weatherData.sys && weatherData.sys.sunrise && weatherData.sys.sunset) {
      sunrise = this.formatTime(weatherData.sys.sunrise * 1000, location.zone);
      sunset = this.formatTime(weatherData.sys.sunset * 1000, location.zone);
    }

    return `<div class="card-content ${
      location.capitalCity ? "capital-city" : ""
    }">
            <div class="location-header">
                <img src="${location.flag}" 
                     alt="${location.country} flag" 
                     class="country-flag">
                <div class="location-info">
                    <h2>${location.name}</h2>
                    <span class="country-name">${location.country}</span>
                    ${
                      location.capitalCity
                        ? '<span class="capital-badge">Capital City</span>'
                        : ""
                    }
                </div>
            </div>
            
            <!-- Landmark image section -->
            <div class="landmark-container">
                <img src="${location.landmark}" 
                     alt="${location.landmarkName}"
                     class="landmark-image">
                <div class="landmark-caption">
                    <span>${location.landmarkName}</span>
                </div>
            </div>

            <div class="weather-main">
                <div class="temperature">
                    ${temp}°C
                    <img class="weather-icon" 
                         src="https://openweathermap.org/img/wn/${
                           weather.icon
                         }@2x.png" 
                         alt="${weather.description}"
                         style="${
                           weather.icon.includes("01")
                             ? "filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))"
                             : ""
                         }">
                </div>
                <div class="weather-description">
                    ${weather.description}
                </div>
                <div class="datetime">
                    ${localTime}
                </div>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">Feels Like</span>
                    <span class="detail-value">${feelsLike}°C</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${windSpeed} m/s</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Pressure</span>
                    <span class="detail-value">${pressure} hPa</span>
                </div>
                ${
                  sunrise && sunset
                    ? `
                <div class="detail-item sun-times">
                    <div class="sunrise">
                        <i class="fas fa-sunrise"></i>
                        <span>${sunrise}</span>
                    </div>
                    <div class="sunset">
                        <i class="fas fa-sunset"></i>
                        <span>${sunset}</span>
                    </div>
                </div>
                `
                    : ""
                }
            </div>
            
            ${
              aqi !== null
                ? `
            <div class="pollution-info">
                <div class="aqi-indicator ${aqiClass}">
                    <span class="aqi-label">Air Quality:</span>
                    <span class="aqi-value">${aqiText}</span>
                </div>
            </div>
            `
                : ""
            }
            
            <div class="forecast-preview">
                <button class="forecast-btn">
                    <i class="fas fa-calendar-alt"></i>
                    View Forecast
                </button>
            </div>
        </div>`;
  }

  getLocalTime(timeZone) {
    try {
      return new Date().toLocaleTimeString("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting time for", timeZone, error);
      return new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  formatTime(timestamp, timeZone) {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting timestamp", error);
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  cleanCache() {
    const now = Date.now();

    // Clean weather cache
    for (const [key, value] of this.weatherCache.entries()) {
      if (now - value.timestamp > this.cacheDuration) {
        this.weatherCache.delete(key);
      }
    }

    // Clean pollution cache
    for (const [key, value] of this.pollutionCache.entries()) {
      if (now - value.timestamp > this.cacheDuration) {
        this.pollutionCache.delete(key);
      }
    }

    console.log("Cache cleaned");
  }

  setLoadingState(isLoading) {
    // Update loading element visibility
    if (this.loadingElement) {
      this.loadingElement.style.display = isLoading ? "flex" : "none";
    }

    // Create loading element if it doesn't exist
    if (isLoading && !this.loadingElement) {
      const loadingElement = document.createElement("div");
      loadingElement.className = "loading-message";
      loadingElement.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading Weather Data...</div>
            `;
      document.body.appendChild(loadingElement);
      this.loadingElement = loadingElement;
    }

    // Update grid state
    if (this.weatherGrid) {
      this.weatherGrid.style.opacity = isLoading ? "0.5" : "1";
      this.weatherGrid.style.pointerEvents = isLoading ? "none" : "auto";
    }
  }

  showError(message) {
    // Remove any existing error
    this.removeError();

    // Create error message
    const errorElement = document.createElement("div");
    errorElement.className = "error-notification";
    errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="close-error">&times;</button>
        `;

    // Add close button functionality
    const closeButton = errorElement.querySelector(".close-error");
    closeButton.addEventListener("click", () => {
      errorElement.classList.add("fade-out");
      setTimeout(() => {
        errorElement.remove();
      }, 300);
    });

    // Add to page
    document.body.appendChild(errorElement);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(errorElement)) {
        errorElement.classList.add("fade-out");
        setTimeout(() => {
          if (document.body.contains(errorElement)) {
            errorElement.remove();
          }
        }, 300);
      }
    }, 10000);
  }

  removeError() {
    const existingError = document.querySelector(".error-notification");
    if (existingError) {
      existingError.remove();
    }
  }
}
