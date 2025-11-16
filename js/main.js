const API_KEY = "6c4a38aa91f6484facd132500251611";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const forecastContainer = document.getElementById("forecast-container");
const loadingMessage = document.getElementById("loading");

const navLinksContainer = document.querySelector(".navbar-nav");
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-content");
const brandLink = document.querySelector(".navbar-brand");
const breadcrumbHomeLink = document.querySelector(".breadcrumb-bar a");
const bootstrapNavbar = document.getElementById("navbarNav");

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.add("page-hidden");
  });

  const activePage = document.getElementById(pageId);
  if (activePage) {
    activePage.classList.remove("page-hidden");
  }

  const activeLink = document.querySelector(
    `.nav-link[data-page="${pageId.replace("page-", "")}"]`
  );
  navLinks.forEach((link) => link.classList.remove("active"));
  if (activeLink) {
    activeLink.classList.add("active");
  }

  const bsCollapse = bootstrap.Collapse.getInstance(bootstrapNavbar);
  if (bsCollapse) {
    bsCollapse.hide();
  }
}

function handleNavClick(e) {
  e.preventDefault();
  const targetLink = e.target.closest("[data-page]");
  if (!targetLink) return;

  const pageName = targetLink.dataset.page;
  const pageId = `page-${pageName}`;
  showPage(pageId);
}

navLinksContainer.addEventListener("click", handleNavClick);
brandLink.addEventListener("click", handleNavClick);
if (breadcrumbHomeLink) {
  breadcrumbHomeLink.addEventListener("click", handleNavClick);
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  if (query) {
    getWeather(query);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value;
    if (query) {
      getWeather(query);
    }
  }
});

window.addEventListener("load", () => {
  showPage("page-home");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeather(`${lat},${lon}`);
      },
      (error) => {
        console.error("Geolocation error:", error);
        getWeather("Cairo");
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    getWeather("Cairo");
  }
});

async function getWeather(location) {
  if (!API_KEY || API_KEY === "PASTE_YOUR_API_KEY_HERE") {
    forecastContainer.innerHTML = `<div class="col-12"><div class="loading-message p-4" style="color: #ffcccc; background-color: #443232; border-radius: 10px;">
      Error: API_KEY is not set. Please get a free key from weatherapi.com and paste it into js/main.js
      </div></div>`;
    return;
  }

  showLoading();

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3&aqi=no&alerts=no`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    forecastContainer.innerHTML = `<div class="col-12"><div class="loading-message p-4" style="color: #ffcccc; border-radius: 10px;">
      Error loading weather data. Please try searching for a valid location.
      </div></div>`;
  }
}

function showLoading() {
  forecastContainer.innerHTML = "";
  loadingMessage.style.display = "block";
  forecastContainer.appendChild(loadingMessage);
}

function displayWeather(data) {
  forecastContainer.innerHTML = "";

  const today = data.forecast.forecastday[0];
  const todayHTML = `
    <div class="col-lg-4 p-0">
      <div class="forecast-card today">
        <div class="forecast-header d-flex justify-content-between">
          <span class="day">${getDayName(today.date)}</span>
          <span class="date">${formatDate(today.date)}</span>
        </div>
        <div class="forecast-content">
          <p class="location">${data.location.name}</p>
          
          <div class="degree">${data.current.temp_c}°C</div>
          
          <div class="condition-icon">
            <img src="https:${data.current.condition.icon}" alt="${
    data.current.condition.text
  }" />
          </div>
          
          <p class="condition-text">${data.current.condition.text}</p>
          
          <div class="condition-details d-flex gap-3">
            <span><i class="fas fa-tint"></i> ${data.current.humidity}%</span>
            <span><i class="fas fa-wind"></i> ${
              data.current.wind_kph
            }km/h</span>
            <span><i class="far fa-compass"></i> ${data.current.wind_dir}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  forecastContainer.insertAdjacentHTML("beforeend", todayHTML);

  for (let i = 1; i < 3; i++) {
    const day = data.forecast.forecastday[i];
    const otherDayHTML = `
      <div class="col-lg-4 p-0">
        <div class="forecast-card other-day text-center">
          <div class="forecast-header d-flex justify-content-center">
            <span class="day">${getDayName(day.date)}</span>
          </div>
          <div class="forecast-content">
            <div class="forecast-icon">
              <img src="https:${day.day.condition.icon}" alt="${
      day.day.condition.text
    }" />
            </div>
            <div class="degree-max">${day.day.maxtemp_c}°C</div>
            <div class="degree-min">${day.day.mintemp_c}°C</div>
            <p class="condition-text">${day.day.condition.text}</p>
          </div>
        </div>
      </div>
    `;
    forecastContainer.insertAdjacentHTML("beforeend", otherDayHTML);
  }
}

function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${day}${month}`;
}