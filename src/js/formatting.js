// Handles all date, time, and display formatting

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

// Format date with custom options
export function formatDateCustom(date, options = {}) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return date.toString();
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

// Wind direction as arrow icon
export function getWindDirection(degrees) {
  // Convert degrees to one of 16 cardinal directions for more precision
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Get a direction arrow symbol based on wind direction
export function getWindArrow(degrees) {
  // Convert degrees to one of 8 basic directions
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const index = Math.round(degrees / 45) % 8;
  return arrows[index];
}

// Format temperature to an integer or with specified decimal places
export function formatTemperature(temp, decimals = 0) {
  return Number(temp).toFixed(decimals);
}

// Format distance with appropriate units
export function formatDistance(distance, unit = "km") {
  if (unit === "km") {
    return distance >= 1
      ? `${Math.round(distance)} km`
      : `${Math.round(distance * 1000)} m`;
  } else {
    // miles
    return distance >= 1
      ? `${Math.round(distance)} mi`
      : `${Math.round(distance * 5280)} ft`;
  }
}

// Format precipitation amount
export function formatPrecipitation(amount) {
  if (amount === 0) return "0 mm";
  if (amount < 0.1) return "< 0.1 mm";
  return `${Math.round(amount * 10) / 10} mm`;
}

// Format wind speed with appropriate units
export function formatWindSpeed(speed, unit = "m/s") {
  const formattedSpeed = Math.round(speed * 10) / 10;
  return `${formattedSpeed} ${unit}`;
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

// Generate Open Street Map URL
export function getMapUrl(lat, lon) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;
}

// Format humidity percentage
export function formatHumidity(humidity) {
  return `${Math.round(humidity)}%`;
}

// Format pressure
export function formatPressure(pressure, unit = "hPa") {
  return `${pressure} ${unit}`;
}

// Format visibility
export function formatVisibility(visibility) {
  // Convert meters to km if over 1000m
  return visibility >= 1000
    ? `${Math.round(visibility / 100) / 10} km`
    : `${visibility} m`;
}

// Get a human-readable description of weather conditions
export function getWeatherDescription(code, description) {
  // Return the API description capitalized
  return description.charAt(0).toUpperCase() + description.slice(1);
}
