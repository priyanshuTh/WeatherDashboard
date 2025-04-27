// Contains general purpose helpers that don't fit in specialized modules

import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";
import { formatTime, displayName, getWindDirection } from "./formatting.js";
import {
  flagBase,
  iconBase,
  placeholderFlag,
  placeholderLandmark,
  getLandmarkForCity,
  isCapitalCity,
} from "./landmarks.js";

// Re-export needed from other modules for backward compatibility
export {
  saveToLocalStorage,
  getFromLocalStorage,
  formatTime,
  displayName,
  getWindDirection,
  flagBase,
  iconBase,
  placeholderFlag,
  placeholderLandmark,
  getLandmarkForCity,
  isCapitalCity,
};

// Convert degrees to radians
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

// Generate a unique ID
export function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Debounce function to limit function calls
export function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Throttle function to limit function calls by time
export function throttle(func, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Check if a value is undefined, null, or empty
export function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

// Deep clone an object
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  // Handle Date
  if (obj instanceof Date) return new Date(obj);

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  // Handle Object
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

// Generate a URL-friendly slug from a string
export function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

// Generate a URL for weather icon using OpenWeatherMap code
export function getWeatherIconUrl(iconCode) {
  return `${iconBase}${iconCode}@2x.png`;
}

// Format a number with comma as thousand separator
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get CSS class based on temperature range
export function getTempClass(temp) {
  if (temp <= 0) return "temp-freezing";
  if (temp <= 10) return "temp-cold";
  if (temp <= 20) return "temp-cool";
  if (temp <= 30) return "temp-warm";
  return "temp-hot";
}

// Calculate heat index (feels like temperature) from temp and humidity
export function calculateHeatIndex(temp, humidity) {
  // Only valid for temperatures above 26°C/80°F
  if (temp < 26) return temp;

  // Formula used by US National Weather Service
  const t = (temp * 9) / 5 + 32; // Convert to Fahrenheit
  const rh = humidity;

  let heatIndex =
    -42.379 +
    2.04901523 * t +
    10.14333127 * rh -
    0.22475541 * t * rh -
    0.00683783 * t * t -
    0.05481717 * rh * rh +
    0.00122874 * t * t * rh +
    0.00085282 * t * rh * rh -
    0.00000199 * t * t * rh * rh;

  // Convert back to Celsius
  heatIndex = ((heatIndex - 32) * 5) / 9;

  return Math.round(heatIndex * 10) / 10;
}

// Check if user is on mobile device
export function isMobileDevice() {
  return (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  );
}

// Get appropriate theme based on time of day
export function getThemeByTime(time = new Date()) {
  const hour = time.getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}
