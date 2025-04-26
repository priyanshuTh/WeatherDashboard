const API_KEY = "bdef3d2164349abfa9cbeecdbe53ae7f";
const BASE = "https://api.openweathermap.org";

// Cache implementation
const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 min

function _memo(key, fetcher) {
  const now = Date.now();
  if (cache.has(key) && now - cache.get(key).ts < TTL) {
    return Promise.resolve(cache.get(key).data);
  }
  return fetcher().then((data) => {
    cache.set(key, { ts: now, data });
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

export function reverseGeocode(lat, lon) {
  const url = `${BASE}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  return fetch(url)
    .then((r) => r.json())
    .then((a) => a[0] ?? null);
}

// Weather & pollution data APIs
export function currentWeather(lat, lon) {
  const key = `current:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    ).then((r) => r.json())
  );
}

export function forecast(lat, lon) {
  const key = `fc:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    ).then((r) => r.json())
  );
}

export function airPollution(lat, lon) {
  const key = `air:${lat},${lon}`;
  return _memo(key, () =>
    fetch(
      `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    ).then((r) => r.json())
  );
}

// Find nearby cities
export function findNearbyCities(lat, lon, count = 12) {
  return fetch(
    `${BASE}/data/2.5/find?lat=${lat}&lon=${lon}&cnt=${count}&units=metric&appid=${API_KEY}`
  ).then((r) => r.json());
}

// Get timezone data
export function getTimezone(lat, lon) {
  return fetch(
    `${BASE}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
  ).then((r) => r.json());
}

// Clear the cache
export function clearCache() {
  cache.clear();
  console.log("API cache cleared");
  return true;
}
