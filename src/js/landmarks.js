// Manages landmark images, flags, and related functionality

// Base URLs for images
export const flagBase = "https://flagcdn.com/w80/";
export const iconBase = "https://openweathermap.org/img/wn/";

// Placeholder images for fallbacks
export const placeholderFlag =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0MzY0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiI+RmxhZyBJbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";
export const placeholderLandmark =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0MzY0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI2ZmZiI+TGFuZG1hcmsgSW1hZ2UgVW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+";

// Enhanced landmark images for popular cities
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
  // Added more cities
  Barcelona:
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Amsterdam:
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Hong Kong":
    "https://images.unsplash.com/photo-1506970845246-18f21d533b20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Seoul:
    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Rio: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "San Francisco":
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Chicago:
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Los Angeles":
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Vancouver:
    "https://images.unsplash.com/photo-1559511260-66a654ae982a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Vienna:
    "https://images.unsplash.com/photo-1516550893885-7b7791d42449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
};

// Capital cities with their country codes
export const capitalCities = {
  London: "GB",
  Paris: "FR",
  Berlin: "DE",
  "Washington D.C.": "US",
  Washington: "US", // Alternative name
  Beijing: "CN",
  Tokyo: "JP",
  Moscow: "RU",
  Rome: "IT",
  Madrid: "ES",
  Ottawa: "CA",
  Brasília: "BR",
  Brasilia: "BR", // Without accent
  Canberra: "AU",
  "New Delhi": "IN",
  Wellington: "NZ",
  Cairo: "EG",
  Dublin: "IE",
  Oslo: "NO",
  Stockholm: "SE",
  Helsinki: "FI",
  Athens: "GR",
  Vienna: "AT", // Keep only one Vienna entry
  Brussels: "BE",
  Jakarta: "ID",
  Bangkok: "TH",
  Manila: "PH",
  Seoul: "KR",
  // Added more capital cities
  Amsterdam: "NL",
  Copenhagen: "DK",
  Lisbon: "PT",
  Ankara: "TR",
  Budapest: "HU",
  Warsaw: "PL",
  Prague: "CZ",
  Bern: "CH",
  Kiev: "UA",
  Kyiv: "UA", // Alternative spelling
  Mexico: "MX", // Short for Mexico City
  "Mexico City": "MX",
  Bogotá: "CO",
  Bogota: "CO", // Without accent
  Lima: "PE",
  Santiago: "CL",
  "Buenos Aires": "AR",
  Caracas: "VE",
  Nairobi: "KE",
  Pretoria: "ZA",
  "Addis Ababa": "ET",
  Riyadh: "SA",
  Tehran: "IR",
  Islamabad: "PK",
  Hanoi: "VN",
  "Kuala Lumpur": "MY",
};

// Function to check if a city is a capital
export function isCapitalCity(cityName, countryCode) {
  return capitalCities[cityName] === countryCode;
}

// Function to get landmark image for a city
export function getLandmarkForCity(cityName) {
  // Try exact match first
  if (landmarkImages[cityName]) {
    return landmarkImages[cityName];
  }

  // Try to match part of the city name for cases where the city name might be slightly different
  for (const [key, value] of Object.entries(landmarkImages)) {
    if (cityName.includes(key) || key.includes(cityName)) {
      return value;
    }
  }

  return placeholderLandmark;
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
        <img src="${iconBase}${
    city.weather.weather[0].icon
  }@2x.png" class="w-12 h-12" alt="${condition}">
        <span class="text-2xl font-bold">${temp}°C</span>
      </div>
      <p class="mt-1 capitalize">${condition}</p>
      ${
        city.isCapital
          ? '<div class="mt-1 text-xs font-semibold text-amber-500">★ Capital City</div>'
          : ""
      }
    </div>
  `;
}

// Get a high-quality flag URL for a country
export function getCountryFlag(countryCode) {
  if (!countryCode) return placeholderFlag;

  const code = countryCode.toLowerCase();
  return `${flagBase}${code}.svg`;
}

// Get alternative landmark (if primary is not available)
export function getAlternativeLandmark(cityName, countryCode) {
  // If no specific city landmark found, try to use a generic country landmark
  const countryLandmarks = {
    US: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Golden Gate Bridge
    GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // London
    FR: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Paris
    DE: "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Berlin
    IT: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Rome
    // Add more generic country landmarks as needed
  };

  return countryLandmarks[countryCode] || placeholderLandmark;
}
