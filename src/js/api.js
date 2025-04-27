// Handles all API calls and data caching

import { memoryCache } from "./storage.js";

const API_KEY = "bdef3d2164349abfa9cbeecdbe53ae7f";
const BASE = "https://api.openweathermap.org";

// TTL for cache items (5 minutes)
const TTL = 5 * 60 * 1000;

// Memoize function for caching API calls
function _memo(key, fetcher) {
  const cached = memoryCache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then((data) => {
    memoryCache.set(key, data, TTL);
    return data;
  });
}

// Improved geocoding that works for any search term
export function geocode(query) {
  const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=5&appid=${API_KEY}`;

  return fetch(url)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Geocoding failed with status: ${r.status}`);
      }
      return r.json();
    })
    .then((results) => {
      if (!results || results.length === 0) {
        console.warn(`No locations found for query: ${query}`);
        return [];
      }
      console.log(
        `Found ${results.length} locations for query: ${query}`,
        results
      );
      return results;
    })
    .catch((error) => {
      console.error("Geocoding error:", error);
      throw error;
    });
}

// Get location information from coordinates
export function reverseGeocode(lat, lon) {
  const url = `${BASE}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  return fetch(url)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Reverse geocoding failed with status: ${r.status}`);
      }
      return r.json();
    })
    .then((a) => a[0] ?? null)
    .catch((error) => {
      console.error("Reverse geocoding error:", error);
      throw error;
    });
}

// Get current weather data
export function currentWeather(lat, lon) {
  const key = `current:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            `Current weather request failed with status: ${r.status}`
          );
        }
        return r.json();
      })
      .catch((error) => {
        console.error(
          `Current weather error for coords (${lat},${lon}):`,
          error
        );
        throw error;
      })
  );
}

// Get forecast data
export function forecast(lat, lon) {
  const key = `fc:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Forecast request failed with status: ${r.status}`);
        }
        return r.json();
      })
      .catch((error) => {
        console.error(`Forecast error for coords (${lat},${lon}):`, error);
        throw error;
      })
  );
}

// Get air pollution data
export function airPollution(lat, lon) {
  const key = `air:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            `Air pollution request failed with status: ${r.status}`
          );
        }
        return r.json();
      })
      .catch((error) => {
        console.error(`Air pollution error for coords (${lat},${lon}):`, error);
        throw error;
      })
  );
}

// Find nearby cities
export function findNearbyCities(lat, lon, count = 12) {
  return fetch(
    `${BASE}/data/2.5/find?lat=${lat}&lon=${lon}&cnt=${count}&units=metric&appid=${API_KEY}`
  )
    .then((r) => {
      if (!r.ok) {
        throw new Error(
          `Find nearby cities request failed with status: ${r.status}`
        );
      }
      return r.json();
    })
    .catch((error) => {
      console.error(
        `Find nearby cities error for coords (${lat},${lon}):`,
        error
      );
      throw error;
    });
}

// Get timezone data
export function getTimezone(lat, lon) {
  const key = `timezone:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Timezone request failed with status: ${r.status}`);
        }
        return r.json();
      })
      .catch((error) => {
        console.error(`Timezone error for coords (${lat},${lon}):`, error);
        throw error;
      })
  );
}

// Get daily forecast data
export function dailyForecast(lat, lon, days = 7) {
  const key = `daily:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=metric`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            `Daily forecast request failed with status: ${r.status}`
          );
        }
        return r.json();
      })
      .catch((error) => {
        console.error(
          `Daily forecast error for coords (${lat},${lon}):`,
          error
        );
        throw error;
      })
  );
}

// Get historical weather data
export function historicalWeather(lat, lon, timestamp) {
  const key = `hist:${lat},${lon}:${timestamp}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            `Historical weather request failed with status: ${r.status}`
          );
        }
        return r.json();
      })
      .catch((error) => {
        console.error(
          `Historical weather error for coords (${lat},${lon}):`,
          error
        );
        throw error;
      })
  );
}

// Get weather alerts
export function weatherAlerts(lat, lon) {
  const key = `alerts:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`
    )
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            `Weather alerts request failed with status: ${r.status}`
          );
        }
        return r.json();
      })
      .catch((error) => {
        console.error(
          `Weather alerts error for coords (${lat},${lon}):`,
          error
        );
        throw error;
      })
  );
}

// Clear the cache
export function clearCache() {
  memoryCache.clear();
  console.log("API cache cleared");
  return true;
}

// Export the memoryCache for potential direct use
export { memoryCache };
