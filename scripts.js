//using the open-meteo.com API for this activity
"use strict";

// API reference: https://open-meteo.com/en/docs
// endpoint: https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=8&current=temperature_2m,weather_code&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch

let conditions = {
    "0" : { "desc" : "Clear Sky", "path" : "images/sun.svg" },
    "1" : { "desc" : "Mostly Clear", "path" : "images/sun.svg" },
    "2" : { "desc": "Partly Cloudy", "path": "images/cloudy.svg" },
    "3" : { "desc": "Overcast", "path": "images/overcast.svg" },
    "45" : { "desc": "Fog", "path": "images/overcast.svg" },
    "48" : { "desc" : "Depositing Rime Fog", "path": "images/overcast.svg" },
    "51" : { "desc" : "Light Drizzle", "path": "images/rain.svg" },
    "53" : { "desc" : "Moderate Drizzle", "path": "images/rain.svg" },
    "55" : { "desc" : "Heavy Drizzle", "path": "images/rain.svg" },
    "56" : { "desc" : "Light Freezing Drizzle", "path": "images/rain.svg" },
    "57" : { "desc" : "Heavy Freezing Drizzle", "path": "images/rain.svg" },
    "61" : { "desc" : "Light Rain", "path": "images/rain.svg" },
    "63" : { "desc" : "Moderate Rain", "path": "images/rain.svg" },
    "65" : { "desc" : "Heavy Rain", "path": "images/rain.svg" },
    "66" : { "desc" : "Light Freezing Rain", "path": "images/rain.svg" },
    "67" : { "desc" : "Heavy Freezing Rain", "path": "images/rain.svg" },
    "71" : { "desc" : "Light Snowfall", "path": "images/snow.svg" },
    "73" : { "desc" : "Moderate Snowfall", "path": "images/snow.svg" },
    "75" : { "desc" : "Heavy Snowfall", "path": "images/snow.svg" },
    "77" : { "desc" : "Snow Grains", "path": "images/snow.svg" },
    "80" : { "desc" : "Light Rain Showers", "path": "images/rain.svg" },
    "81" : { "desc" : "Moderate Rain Showers", "path": "images/rain.svg" },
    "82" : { "desc" : "Violent Rain Showers", "path": "images/rain.svg" },
    "85" : { "desc" : "Light Snow Showers", "path": "images/snow.svg" },
    "86" : { "desc" : "Heavy Snow Showers", "path": "images/snow.svg" },
    "95" : { "desc" : "Slight Thunderstorm", "path": "images/thunderstorm.svg" },
    "96" : { "desc" : "Thunderstorm with Light Hail", "path": "images/thunderstorm.svg" },
    "99" : { "desc" : "Thunderstorm with Heavy Hail", "path": "images/thunderstorm.svg" }
};

// function to display the weather to the page after getting a response from the API
function displayData(data){
    let current = document.getElementById("current");
    let forecast = document.getElementById("forecast");

    if(data.error){
        current.innerHTML = `<p>There was an error: ${data.reason || "Unable to fetch weather data"}. Please try again later.</p>`;
    }else{
        let today = new Date();
        
        // Use Intl.DateTimeFormat for easy naming
        let dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        let monthName = today.toLocaleDateString('en-US', { month: 'long' });
        let dateNum = today.getDate();

        // Get conditions based on current weather code
        let currentCode = data.current.weather_code;
        let currentCondition = conditions[currentCode] || { desc: "Unknown", path: "" };

        //the current weather
        let currentHTML = `<h3>${data.timezone}</h3>
                            <p>${dayName}, ${monthName} ${dateNum}</p>
                            <img src="${currentCondition.path}" alt="${currentCondition.desc}">
                            <p><b>Current Weather: </b>${Math.round(data.current.temperature_2m)}&deg; and ${currentCondition.desc}</p>
                            `;
        current.innerHTML = currentHTML;

        let forecastHTML = "";

        //the upcoming forecast
        for(let i = 0; i < 8; i++){
            // generate a date object from the given date for this day in the forecast
            let date = new Date(data.daily.time[i] + "T00:00"); 

            let fDayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            let fMonthName = date.toLocaleDateString('en-US', { month: 'long' });
            let fDateNum = date.getDate();
            
            let fCode = data.daily.weather_code[i];
            let fCondition = conditions[fCode] || { desc: "Unknown", path: "" };

            // add the weather for each date to the page with the information listed in comments above
            forecastHTML += `<section class="day">
                                <h3><span>${fDayName}</span> ${fMonthName} ${fDateNum}</h3>
                                <img src="${fCondition.path}" alt="${fCondition.desc}">
                                <p><b>High: </b>${Math.round(data.daily.temperature_2m_max[i])}&deg;</p>
                                <p><b>Low: </b>${Math.round(data.daily.temperature_2m_min[i])}&deg;</p>
                                <p>${fCondition.desc}</p>
                            </section>`;
        }
    forecast.innerHTML = forecastHTML;
    }
}

//build URL for API call
async function getWeather(location){
    let latitude = location.coords.latitude;
    let longitude = location.coords.longitude;

    // Use the specific endpoint requirements from the instructions
    let endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=8&current=temperature_2m,weather_code&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`; 

    // fetch call to API
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error("Fetch error:", error);
        displayData({ error: true, reason: error.message });
    }
}

//on page load, get geolocation
window.addEventListener("load", function(){
    if(!navigator.geolocation) {
        document.getElementById("forecast").textContent = 'Geolocation is not supported by your browser';
    } else {
        navigator.geolocation.getCurrentPosition(getWeather);
    }

    let now = new Date();
    let span = document.querySelector("footer span");
    span.innerHTML = now.getFullYear();
});