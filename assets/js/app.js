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
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    container.classList.remove("fade-in");
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
                <img src="/static/images/weather_icons/${icon}.png" width="64" alt="${description}"
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

        /**
         * TODAY'S HIGHLIGHTS
         */
        fetchData(url.airPollution(lat, lon), (airPollution) => {

            const [{
                main: { aqi },
                components: { no2, o3, so2, pm2_5 }
            }] = airPollution.list;

            const card = document.createElement("div");
            card.classList.add("card-lg", "bg-surface", "text-on_surface", "rounded-radius_28", "p-9")

            card.innerHTML = `
                <h2 class="text-title_2 xl:text-[2rem] mb-5" id="highlights-label">Today's Highlights</h2>
                <div class="highlight-list">
                    <div class="card bg-surface text-on_surface highlight-card one">
                        <div class="card-sm rounded-radius_16 p-8 bg-black_alpha_10 relative">
                            <h3 class="text-title_3 font-semibold text-on_surface_variant mb-5">Air Quality
                                Index</h3>
                            <div class="wrapper">
                                <span class="m-icon">air</span>
                                <ul class="card-list w-min">
                                    <li class="card-item">
                                        <p class="text-title_1 md:text- xl:text-5xl">${pm2_5.toPrecision(3)}</p>
                                        <p class="text-label_1 text-on_surface_variant">PM<sub>2.5</sub></p>
                                    </li>

                                    <li class="card-item">
                                        <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${so2.toPrecision(3)}</p>
                                        <p class="text-label_1 text-on_surface_variant">SO<sub>2</sub></p>
                                    </li>

                                    <li class="card-item">
                                        <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${no2.toPrecision(3)}</p>
                                        <p class="text-label_1 text-on_surface_variant">NO<sub>2</sub></p>
                                    </li>

                                    <li class="card-item">
                                        <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${o3.toPrecision(3)}</p>
                                        <p class="text-label_1 text-on_surface_variant">O<sub>3</sub></p>
                                    </li>
                                </ul>
                            </div>
                            <span class="badge aqi-${aqi} text-label_${aqi}" title="${module.aqiText[aqi].message}">${module.aqiText[aqi].level}</span>
                        </div>
                    </div>

                    <div class="card bg-surface text-on_surface highlight-card two">
                        <div class="card-sm rounded-radius_16 p-8 bg-black_alpha_10 relative">
                            <h2 class="text-title_3 font-semibold text-on_surface_variant mb-5">Sunrise & Sunset
                            </h2>
                            <div class="card-list">
                                <div class="card-item">
                                    <span class="m-icon">clear_day</span>
                                    <div>
                                        <p class="text-label_1 text-on_surface_variant mb-1">Sunrise</p>
                                        <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${module.getTime(sunriseUnixUTC, timezone)}</p>
                                    </div>
                                </div>

                                <div class="card-item">
                                    <span class="m-icon">clear_night</span>
                                    <div>
                                        <p class="text-label_1 text-on_surface_variant mb-1">Sunset</p>
                                        <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${module.getTime(sunsetUnixUTC, timezone)}</p>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    <div class="card bg-surface text-on_surface highlight-card">
                        <div class="card-sm rounded-radius_16 p-8 bg-black_alpha_10 relative">
                            <h3 class="text-title_3 font-semibold text-on_surface_variant mb-5">Humidity</h3>
                            <div class="wrapper">
                                <span class="m-icon">humidity_percentage</span>
                                <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${humidity}<sub>%</sub></p>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-surface text-on_surface highlight-card">
                        <div class="card-sm rounded-radius_16 p-8 bg-black_alpha_10 relative">
                            <h3 class="text-title_3 font-semibold text-on_surface_variant mb-5">Pressure</h3>
                            <div class="wrapper">
                                <span class="m-icon">airwave</span>
                                <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${pressure}<sub>hPa</sub></p>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-surface text-on_surface highlight-card">
                        <div class="card-sm rounded-radius_16 p-8 bg-black_alpha_10 relative">
                            <h3 class="text-title_3 font-semibold text-on_surface_variant mb-5">Visibility</h3>
                            <div class="wrapper">
                                <span class="m-icon">visibility</span>
                                <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${visibility / 1000}<sub>km</sub></p>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-surface text-on_surface highlight-card">
                        <div class="card-sm rounded-radius_16 p-8 bg-black_alpha_10 relative">
                            <h3 class="text-title_3 font-semibold text-on_surface_variant mb-5">Feels like</h3>
                            <div class="wrapper">
                                <span class="m-icon">thermostat</span>
                                <p class="text-title_1 md:text-[2.4rem] xl:text-5xl">${parseInt(feels_like)}&deg;<sup>c</sup></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            highlightSection.appendChild(card);
        });

        /**
         * HOURLY FORECAST
         */
        fetchData(url.forecast(lat, lon), (forecast) => {

            const {
                list: forecastList,
                city: { timezone }
            } = forecast;

            hourlySection.innerHTML = `
                <h2 class="text-title_2 xl:text-[2rem] mb-5">Today at</h2>
                <div class="slider-container">
                    <ul class="slider-list" data-temp></ul>

                    <ul class="slider-list" data-wind></ul>
                </div>
            `;

            for (const [index, data] of forecastList.entries()) {

                if (index > 7) break;

                const {
                    dt: dateTimeUnix,
                    main: { temp },
                    weather,
                    wind: { deg: windDirection, speed: windSpeed }
                } = data;
                const [{icon, description}] = weather;

                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");

                tempLi.innerHTML = `
                    <div class="card-sm slider-card rounded-radius_16 p-8 bg-white_alpha_8 relative">
                        
                        <p class="text-body_3">${module.getHours(dateTimeUnix, timezone)}</p>
                        
                        <img src="/static/images/weather_icons/${icon}.png" width="48" loading="lazy"
                            class="weather-icon" alt="${description}" title="${description}">
                        
                        <p class="text-body_3">${parseInt(temp)}&deg;</p>
                    </div>
                `;
                hourlySection.querySelector("[data-temp]").appendChild(tempLi);

                const windLi = document.createElement("li");
                windLi.classList.add("slider-item");

                windLi.innerHTML = `
                    <div class="card-sm slider-card rounded-radius_16 p-8 bg-white_alpha_8 relative">
                        
                        <p class="text-body_3">${module.getHours(dateTimeUnix, timezone)}</p>
                        
                        <img src="/static/images/weather_icons/direction.png" width="48" loading="lazy"
                            class="weather-icon" alt="direction" style="transform: rotate(${windDirection - 180}deg)">
                        
                        <p class="text-body_3">${parseInt(module.mps_to_kmh(windSpeed))} km/h</p>
                    </div>
                `;
                hourlySection.querySelector("[data-wind]").appendChild(windLi);
            
            }

        /**
         * 5 DAYS FORECAST
         */
        forecastSection.innerHTML = `   
        <h2 class="text-title_2 xl:text-[2rem] mb-5" id="forecast-label">5 Days Forecast</h2>
        <div class="card-lg bg-surface text-on_surface rounded-radius_28 p-9 forecast-card">
            <ul data-forecast-list></ul>
        </div>
        `;
        
        let i=1;
        if (timezone>0){
            i=7;
        }
        
        for (i; i<forecastList.length; i+=8){

            const {
                main: {temp_max},
                weather,
                dt_txt
            } = forecastList[i];
            const [{icon, description}] =weather;
            const date=new Date(dt_txt);

            const li=document.createElement("li");
            li.classList.add("card-item")

            li.innerHTML =  `
                <div class="icon-wrapper">
                    <img src="/static/images/weather_icons/${icon}.png" width="36" alt="${description}"
                        class="weather-icon" title="${description}">
                    <span class="">
                        <p class="text-title_2 xl:text-[2.2rem]">${parseInt(temp_max)}&deg;</p>
                    </span>
                </div>
                <p class="text-label_1 text-on_surface_variant font-semibold w-full text-right">${date.getDate()} ${module.monthNames[date.getMonth()]}</p>
                <p class="text-label_1 text-on_surface_variant font-semibold w-full text-right">${module.weekDayNames[date.getDay()]}</p>
            `;
            forecastSection.querySelector("[data-forecast-list]").appendChild(li);

        }
        
        loading.style.display = "none";
        container.style.overflowY = "overlay";
        container.classList.add("fade-in");

        });

    });

}

export const error404 = () => errorContent.style.display = "flex";
