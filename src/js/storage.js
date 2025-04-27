// Handles localStorage, caching, and other storage functionality

// Save data to localStorage with error handling
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
    return false;
  }
}

// Get data from localStorage with error handling
export function getFromLocalStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving from localStorage: ${key}`, error);
    return defaultValue;
  }
}

// Clear specific item from localStorage
export function clearFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
}

// Clear all items from localStorage
export function clearAllLocalStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

// Check if localStorage is available
export function isLocalStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Create an expiring item in localStorage
export function setWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };

  return saveToLocalStorage(key, item);
}

// Get an item from localStorage and check if it's expired
export function getWithExpiry(key, defaultValue = null) {
  const itemStr = localStorage.getItem(key);

  // If the item doesn't exist, return default
  if (!itemStr) {
    return defaultValue;
  }

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    // If the item is expired, remove it and return default
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return defaultValue;
    }

    return item.value;
  } catch (error) {
    console.error(`Error retrieving item with expiry: ${key}`, error);
    return defaultValue;
  }
}

// In-memory cache implementation
class Cache {
  constructor(defaultTTL = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  // Set a cache item with optional custom TTL
  set(key, data, ttl = this.defaultTTL) {
    const expiryTime = Date.now() + ttl;
    this.cache.set(key, { data, expiryTime });
    return true;
  }

  // Get an item from cache
  get(key) {
    if (!this.has(key)) {
      return null;
    }

    const item = this.cache.get(key);

    // Check if expired
    if (Date.now() > item.expiryTime) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  // Check if cache has a valid (not expired) key
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const item = this.cache.get(key);

    // Check if expired
    if (Date.now() > item.expiryTime) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // Delete a cache item
  delete(key) {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    return true;
  }

  // Get all valid keys
  keys() {
    // Filter out expired keys
    return [...this.cache.keys()].filter((key) => this.has(key));
  }

  // Get cache size (count of valid items)
  size() {
    return this.keys().length;
  }
}

// Create and export a default cache instance
export const memoryCache = new Cache();

// Export the Cache class for creating custom caches
export { Cache };
