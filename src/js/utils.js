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
    return new Date(ts).toLocaleTimeString("en-US", { timeZone: tz, ...base });
  } catch (error) {
    console.error("Error formatting time:", error);
    return new Date(ts).toLocaleTimeString("en-US", base);
  }
}

// Get formatted local time
export function getLocalTime(timeZone) {
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
    console.error("Error getting local time:", error);
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
  if (aqi === null || aqi === undefined) return "aqi-unknown";
  return (
    [
      "aqi-unknown",
      "aqi-good",
      "aqi-fair",
      "aqi-moderate",
      "aqi-poor",
      "aqi-very-poor",
    ][aqi] || "aqi-unknown"
  );
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
};

// Function to check if a city is a capital
export function isCapitalCity(cityName, countryCode) {
  return capitalCities[cityName] === countryCode;
}

// Function to get landmark image for a city
export function getLandmarkForCity(cityName) {
  return landmarkImages[cityName] || placeholderLandmark;
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
