$(document).ready(function () {
  var cityArray = [];
  var lon = "";
  var lat = "";
  var apiKey = "39edc21fee70b725a0dbcb6dbed85366";
  var city = "";

  retrieveCityArray();

  // When user searches for city
  $("#add-city").on("click", function (event) {
    event.preventDefault();

    storeCityArray();
    retrieveCityArray();
  });

  // When user clicks city button
  $(document).on("click", ".city-button", getCityClicked);

  function storeCityArray() {
    city = $("#city-input").val().trim();
    localStorage.setItem("lastSearchedCity", JSON.stringify(city));

    cityArray.push(city);
    localStorage.setItem("cities", JSON.stringify(cityArray));
  }

  function retrieveCityArray() {
    var retrievedArray = localStorage.getItem("cities");
    city = JSON.parse(localStorage.getItem("lastSearchedCity"));

    if (retrievedArray !== null) {
      cityArray = JSON.parse(retrievedArray);
      renderCityButtons();
      getLonLat();
    }
  }

  function renderCityButtons() {
    $("#city-buttons-div").empty();

    for (var i = 0; i < cityArray.length; i++) {
      var newButton = $("<button>");

      newButton.addClass("btn btn-outline-secondary city-button");
      newButton.attr("city-name", cityArray[i]);
      newButton.text(cityArray[i]);

      $("#city-buttons-div").prepend(newButton);
    }
  }

  function getCityClicked() {
    city = $(this).attr("city-name");
    localStorage.setItem("lastSearchedCity", JSON.stringify(city));
    getLonLat();
  }

  function getLonLat() {
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&appid=" +
      apiKey;
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      lon = response.coord.lon;
      lat = response.coord.lat;
      getWeatherAPIInfo();
    });
  }

  function getWeatherAPIInfo() {
    var queryURL =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&exclude={part}&appid=" +
      apiKey;
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      renderPage(response);
    });
  }

  function renderPage(response) {
    renderCurrentDayTitle(response);
    renderCurrentDayBody(response);
    renderUVISpan(response);
    renderForecast(response);
    $("#weather-info-body").css("display", "block");
  }

  function getDate(response) {
    var date = new Date(response.dt * 1000);

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return day + "/" + month + "/" + year;
  }

  function getIconURL(iconCode) {
    return (iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png");
  }

  function kelvinToCelsius(kelvin) {
    return Math.round((kelvin - 273.15) * 10) / 10;
  }

  function getWindSpeedMPH(metresPerSec) {
    return (speedMPH = Math.round(metresPerSec * 2.237 * 10) / 10);
  }

  function renderCurrentDayTitle(response) {
    var titleElement = $("#city-date-icon");
    var iconElement = $("<img></img>");

    var date = "(" + getDate(response.daily[0]) + ")";
    var iconCode = response.current.weather[0].icon;

    titleElement.text(city + " " + date + " ");
    iconElement.attr("src", getIconURL(iconCode));
    titleElement.append(iconElement);
  }

  function renderCurrentDayBody(response) {
    var temp = kelvinToCelsius(response.current.temp);
    var humidity = response.current.humidity;
    var windSpeed = getWindSpeedMPH(response.current.wind_speed);

    $("#current-temp").text("Temperature: " + temp + "°C");
    $("#current-humidity").text("Humidity: " + humidity + "%");
    $("#current-wind-speed").text("Wind Speed: " + windSpeed + " mph");
  }

  function renderUVISpan(response) {
    var uvi = response.current.uvi;
    var uviSpan = $("<span></span>");
    uviSpan.attr("id", "uviValue");
    uviSpan.text(uvi);

    setUVIBackground(uvi, uviSpan);

    var uviElement = $("#current-uvi");
    uviElement.text("UV Index: ");
    uviElement.append(uviSpan);
  }

  function setUVIBackground(uvi, uviSpan) {
    if (uvi <= 2) {
      uviSpan.css({ "background-color": "#5cb85c", "border-color": "#4cae4c" });
    } else if (uvi > 2 && uvi <= 5) {
      uviSpan.css({ "background-color": "#f0ad4e", "border-color": "#eea236" });
    } else {
      uviSpan.css({ "background-color": "#d9534f", "border-color": "#d43f3a" });
    }
  }

  function renderForecast(response) {
    for (var i = 1; i <= 5; i++) {
      getForecastDate(response, i);
      getForecastIcon(response, i);
      getForecastData(response, i);
    }
  }

  function getForecastDate(response, i) {
    var date = getDate(response.daily[i]);
    var id = "#forecast-date-" + i;
    $(id).text(date);
  }

  function getForecastIcon(response, i) {
    var iconCode = response.daily[i].weather[0].icon;
    getIconURL(iconCode);
    var id = "#forecast-icon-" + i;
    $(id).attr("src", iconURL);
  }

  function getForecastData(response, i) {
    var temp = kelvinToCelsius(response.daily[i].temp.day);
    var humidity = response.daily[i].humidity;

    tempID = "#forecast-temp-" + i;
    humidityID = "#forecast-humidity-" + i;

    $(tempID).text("Temp: " + temp + "°C");
    $(humidityID).text("Humidity: " + humidity + "%");
  }
});
