'use strict';

import { fetchData, url } from "./api";
import * as module from "./module";

/**
 * Add event listener on multiple elements
 * @param {NodeList} elements Elements node array
 * @param {string} eventType Event Type eg: "Click", "mouseover"
 * @param {Function} callback Callback Function
 */
const addEventOnElements = (elements, eventType, callback) => {
    for (const element of elements) element.addEventListener(eventType, callback);
}

/**
 * Toggle search in mobile devices
 */
const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]")

const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchTogglers, "click", toggleSearch);

/**
 * SEARCH INTEGRATION
 */
const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", () => {

    searchTimeout ?? clearTimeout(searchTimeout);

    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), (locations) => {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `
                <ul class="view-list" data-search-list></ul>
                `;

                const /** {NodeList} | [] */ items = [];

                for (const { name, lat, lon, country, state } of locations) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");

                    searchItem.innerHTML = `
                    <span class="m-icon text-on_surface_variant">location_on</span>
                    <div>
                        <p class="item-title">${name}</p>
                        <p class="item-subtitle text-on_surface_variant">${state || ""} ${country}</p>
                    </div>
                    <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state absolute inset-0 " aria-label="${name} weather" data-search-toggler></a>
                    `;

                    searchResult.querySelector("[data-search-list]").appendChild(searchItem);
                    items.push(searchItem.querySelector("[data-search-toggler]"));

                    addEventOnElements(items, "click", () => {
                        toggleSearch();
                        searchResult.classList.remove("active");
                    });
                }
            });
        }, searchTimeoutDuration);
    }

});


const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");

/**
 * Render all the data in the html page
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 */
export const updateWeather = (lat, lon) => {
    // loading.style.display = "grid";
    // container.style.overflowY = "hidden";
    // container.classList.remove("fade-in");
    errorContent.style.display = "none";

    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highlightSection = document.querySelector("[data-highlights]");
    const hourlySection = document.querySelector("[data-hourly-forecast]");
    const forecastSection = document.querySelector("[data-5-day-forecast]");

    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    forecastSection.innerHTML = "";

    if (window.location.hash === "#/current-location") {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled");
    }

    /**
     * CURRENT WEATHER SECTION
     */
    fetchData(url.currentWeather(lat, lon), (currentWeather) => {

        const {
            weather,
            dt: dateUnix,
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity },
            visibility,
            timezone
        } = currentWeather
        const [{ description, icon }] = weather;

        const card = document.createElement("div");
        card.classList.add("card-lg", "bg-surface", "text-on_surface", "rounded-radius_28", "p-9", "current-weather-card")

        card.innerHTML = `
            <h2 class="text-title_2 xl:text-[2rem] mb-5 card-title">Now</h2>
            <div class="wrapper">
                <p class="text-white text-heading xl:text-[8rem] leading-[1.1]">${parseInt(temp)}&deg;<sup
                        class="text-7xl">c</sup></p>
                <img src="/assets/images/weather_icons/${icon}.png" width="64" alt="${description}"
                    class="weather-icon">
            </div>
            <p class="text-body_3">${description}</p>
            <ul class="meta-list">
                <li class="meta-item">
                    <span class="m-icon text-on_surface">calendar_today</span>
                    <p class="text-title_3 font-semibold meta-text">${module.getDate(dateUnix, timezone)}</p>
                </li>
                <li class="meta-item">
                    <span class="m-icon text-on_surface">location_on</span>
                    <p class="text-title_3 font-semibold meta-text" data-location></p>
                </li>
            </ul>
        `;

        fetchData(url.reverseGeo(lat, lon), ([{ name, country }]) => {
            card.querySelector("[data-location]").innerHTML = `${name}, ${country}`
        });

        currentWeatherSection.appendChild(card);

        


    });

}

export const error404 = () => {

}
