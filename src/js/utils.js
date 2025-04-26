// Base URLs for images
export const flagBase = "https://flagcdn.com/w80/";
export const iconBase = "https://openweathermap.org/img/wn/";
export const placeholderFlag =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0MzY0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiI+RmxhZyBJbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";
export const placeholderLandmark =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0MzY0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI2ZmZiI+TGFuZG1hcmsgSW1hZ2UgVW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+";

// Format time with timezone
export function formatTime(ts, tz, opts = {}) {
  const base = { hour: "2-digit", minute: "2-digit", hour12: true, ...opts };
  try {
    return new Date(ts).toLocaleTimeString("en-US", {
      timeZone: tz || "UTC",
      ...base,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return new Date(ts).toLocaleTimeString("en-US", base);
  }
}

// Get formatted local time
export function getLocalTime(timeZone) {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: timeZone || "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error getting local time:", error);
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}

// Get formatted date
export function formatDate(timestamp, timezone) {
  try {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      timeZone: timezone || "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date(timestamp * 1000).toLocaleDateString("en-US");
  }
}

// Get country name from code
export function displayName(regionCode) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(regionCode);
  } catch {
    return regionCode;
  }
}

// Air Quality Index helper functions
export function aqiText(aqi) {
  return (
    ["Unknown", "Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi] ??
    "Unknown"
  );
}

export function aqiClass(aqi) {
  const classes = {
    0: "bg-white/5 border-l-4 border-gray-400",
    1: "bg-aqi-good/10 border-l-4 border-aqi-good",
    2: "bg-aqi-fair/10 border-l-4 border-aqi-fair",
    3: "bg-aqi-moderate/10 border-l-4 border-aqi-moderate",
    4: "bg-aqi-poor/10 border-l-4 border-aqi-poor",
    5: "bg-aqi-very-poor/10 border-l-4 border-aqi-very-poor",
  };

  return classes[aqi] || classes[0];
}

// Chart colors
export function getChartColor(i) {
  const palette = [
    "rgba(59,130,246,1)", // Blue
    "rgba(139,92,246,1)", // Purple
    "rgba(236,72,153,1)", // Pink
    "rgba(34,197,94,1)", // Green
    "rgba(245,158,11,1)", // Amber
  ];
  return palette[i % palette.length];
}

// Chart background colors (with transparency)
export function getChartColorAlpha(i, alpha = 0.7) {
  const palette = [
    `rgba(59,130,246,${alpha})`, // Blue
    `rgba(139,92,246,${alpha})`, // Purple
    `rgba(236,72,153,${alpha})`, // Pink
    `rgba(34,197,94,${alpha})`, // Green
    `rgba(245,158,11,${alpha})`, // Amber
  ];
  return palette[i % palette.length];
}

// Landmark images for popular cities
export const landmarkImages = {
  London:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "New York":
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Tokyo:
    "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Mexico City":
    "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Sydney:
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Paris:
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Berlin:
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Madrid:
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Beijing:
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Delhi:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Mumbai:
    "https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Bangkok:
    "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Cairo:
    "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Istanbul:
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Moscow:
    "https://images.unsplash.com/photo-1513326738677-b964603b136d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Stockholm:
    "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Toronto:
    "https://images.unsplash.com/photo-1517090504586-fde019d8ee91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
};

// Capital cities with their country codes
export const capitalCities = {
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
  Wellington: "NZ",
  Cairo: "EG",
  Dublin: "IE",
  Oslo: "NO",
  Stockholm: "SE",
  Helsinki: "FI",
  Athens: "GR",
  Vienna: "AT",
  Brussels: "BE",
  Jakarta: "ID",
  Bangkok: "TH",
  Manila: "PH",
  Seoul: "KR",
};

// Function to check if a city is a capital
export function isCapitalCity(cityName, countryCode) {
  return capitalCities[cityName] === countryCode;
}

// Function to get landmark image for a city
export function getLandmarkForCity(cityName) {
  return landmarkImages[cityName] || placeholderLandmark;
}

// Weather condition to icon mapping
export function getWeatherIcon(conditionCode) {
  // Make sure we have the right format for the icon
  if (!conditionCode) return "cloud"; // Default icon

  const mapping = {
    "01d": "sun", // Clear sky (day)
    "01n": "moon", // Clear sky (night)
    "02d": "cloud-sun", // Few clouds (day)
    "02n": "cloud-moon", // Few clouds (night)
    "03d": "cloud", // Scattered clouds
    "03n": "cloud",
    "04d": "clouds", // Broken clouds
    "04n": "clouds",
    "09d": "cloud-showers-heavy", // Shower rain
    "09n": "cloud-showers-heavy",
    "10d": "cloud-sun-rain", // Rain (day)
    "10n": "cloud-moon-rain", // Rain (night)
    "11d": "bolt", // Thunderstorm
    "11n": "bolt",
    "13d": "snowflake", // Snow
    "13n": "snowflake",
    "50d": "smog", // Mist
    "50n": "smog",
  };

  return mapping[conditionCode] || "cloud-question";
}

// Wind direction as arrow icon
export function getWindDirection(degrees) {
  // Convert degrees to one of 8 basic directions
  const directions = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Local storage helpers
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
    return false;
  }
}

export function getFromLocalStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving from localStorage: ${key}`, error);
    return defaultValue;
  }
}

// Generate Open Street Map URL
export function getMapUrl(lat, lon) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;
}

// Get a proper map popup content
export function getMapPopupContent(city) {
  if (!city) return "";

  const temp = Math.round(city.weather.main.temp);
  const condition = city.weather.weather[0].description;
  const country = city.country || "";

  return `
    <div class="map-popup">
      <h3 class="text-lg font-bold">${city.name}, ${country}</h3>
      <div class="flex items-center mt-2">
        <img src="${iconBase}${city.weather.weather[0].icon}@2x.png" class="w-12 h-12" alt="${condition}">
        <span class="text-2xl font-bold">${temp}°C</span>
      </div>
      <p class="mt-1 capitalize">${condition}</p>
    </div>
  `;
}
