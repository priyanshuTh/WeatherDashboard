// Handles map-related functionality using Leaflet

import { getMapPopupContent } from "./landmarks.js";

// Map instance
let map = null;
let mapMarkers = [];

// Initialize map
export function initMap(city) {
  const mapContainer = document.getElementById("mapContainer");
  if (!mapContainer) return;

  // Clear any existing map
  mapContainer.innerHTML = "";
  clearMapMarkers();

  // Initialize the map if not already
  if (!map) {
    map = L.map("mapContainer").setView([city.lat, city.lon], 10);

    // Add tile layer with language=en parameter to ensure English names
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      language: "en",
    }).addTo(map);
  } else {
    // Just update the view if map exists
    map.setView([city.lat, city.lon], 10);
  }

  // Add marker for the city with accurate coordinates
  const marker = L.marker([city.lat, city.lon]).addTo(map);

  // Add popup with city info
  marker.bindPopup(getMapPopupContent(city)).openPopup();

  // Add to markers array for later cleanup
  mapMarkers.push(marker);

  // Force map to update size (needed after modal opens)
  setTimeout(() => {
    map.invalidateSize();
  }, 300);

  return map;
}

// Add multiple markers to the map
export function addMapMarkers(cities) {
  if (!map) return;

  // Clear existing markers
  clearMapMarkers();

  // Add a marker for each city
  cities.forEach((city) => {
    const marker = L.marker([city.lat, city.lon]).addTo(map);
    marker.bindPopup(getMapPopupContent(city));
    mapMarkers.push(marker);
  });

  // Fit map to show all markers
  if (mapMarkers.length > 1) {
    const group = new L.featureGroup(mapMarkers);
    map.fitBounds(group.getBounds().pad(0.1));
  }

  return mapMarkers;
}

// Clear all markers from the map
export function clearMapMarkers() {
  if (!map) return;

  // Remove all markers from the map
  mapMarkers.forEach((marker) => {
    map.removeLayer(marker);
  });

  // Clear the markers array
  mapMarkers = [];
}

// Add a circle showing radius around a point
export function addRadiusCircle(lat, lon, radiusKm, options = {}) {
  if (!map) return null;

  // Default styling
  const defaultOptions = {
    color: "#3b82f6",
    fillColor: "#3b82f6",
    fillOpacity: 0.2,
    weight: 2,
  };

  // Merge options
  const circleOptions = { ...defaultOptions, ...options };

  // Create circle (radius in meters)
  const circle = L.circle([lat, lon], radiusKm * 1000, circleOptions).addTo(
    map
  );

  return circle;
}

// Add a custom icon marker
export function addCustomMarker(lat, lon, icon, popupContent = null) {
  if (!map) return null;

  // Create custom icon
  const customIcon = L.divIcon({
    html: icon,
    className: "custom-map-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  // Create marker with custom icon
  const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

  // Add popup if content provided
  if (popupContent) {
    marker.bindPopup(popupContent);
  }

  // Track the marker
  mapMarkers.push(marker);

  return marker;
}

// Get the current map bounds as an object
export function getMapBounds() {
  if (!map) return null;

  const bounds = map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

// Set the map view to specific bounds
export function setMapBounds(north, south, east, west, padding = 0) {
  if (!map) return;

  const bounds = L.latLngBounds(L.latLng(south, west), L.latLng(north, east));

  map.fitBounds(bounds, { padding: [padding, padding] });
}

// Calculate distance between two points (haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Helper function: Convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Add a polyline between two points (for showing routes)
export function addPolyline(points, options = {}) {
  if (!map) return null;

  // Default styling
  const defaultOptions = {
    color: "#3b82f6",
    weight: 3,
    opacity: 0.7,
    lineJoin: "round",
  };

  // Merge options
  const lineOptions = { ...defaultOptions, ...options };

  // Create polyline
  const polyline = L.polyline(points, lineOptions).addTo(map);

  return polyline;
}

// Cleanup function to destroy the map
export function destroyMap() {
  if (map) {
    clearMapMarkers();
    map.remove();
    map = null;
  }
}

// Export for use in other modules
export { map, mapMarkers };
