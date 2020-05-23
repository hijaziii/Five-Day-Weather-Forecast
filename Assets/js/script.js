var savedLocations = [];
var currentLocations;
// Grabbing last serached location from Local Storage.
function initialize() {
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
    // Diplaying buttons and last city searched.
    if (savedLocations) {
        currentLocations = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currentLocations);
    }
    // Getting Users Location if cancled rquest displaying Los Angeles.
    else {
       if (!navigator.geolocation) {
            getCurrent("Los Angeles");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=a1eb1ea93b53f1fa62f95489bb5aae8b";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLocations = response.name;
        saveLocation(response.name);
        getCurrent(currentLocations);
    });

}
// Incase of no city search or not getting geolocation diplay Los Angeles as current.
function error(){
    currentLocations = "Los Angeles"
    getCurrent(currentLocations);
}

//Change color when onclick other wise keepit original
function showPrevious() {
    // Displating all locations searched from local storage.
    if (savedLocations) {
        $("#oldSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locationBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currentLocations){
                locationBtn.attr("class", "list-group-item list-group-item-action active");//change color
            }
            else {
                locationBtn.attr("class", "list-group-item list-group-item-action ");//original color
            }
            btns.prepend(locationBtn);
        }
        $("#oldSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=a1eb1ea93b53f1fa62f95489bb5aae8b&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            initialize();
        }
    }).then(function (response) {
        //Creating card
        var newCard = $("<div>").attr("class", "card bg-light");
        $("#weatherforecast").append(newCard);       

        var cardRow = $("<div>").attr("class", "row no-gutters");
        newCard.append(cardRow);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardDiv = $("<div>").attr("class", "card-body");
        textDiv.append(cardDiv);
         
        cardDiv.append($("<h1>").attr("class", "card-title").text(response.name));
        var cardIcon = $("<img>").attr("class", "card-body").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon +"@2x.png");
        cardDiv.append(cardIcon);
        var todaysDate = moment(response.dt, "X").format("dddd, MMMM Do YYYY");
        cardDiv.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text( todaysDate)));
        cardDiv.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        cardDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        cardDiv.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        // UV Index
        var queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=a1eb1ea93b53f1fa62f95489bb5aae8b&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var uvIndex = response.value;
            var uvColor;
            if (uvIndex <= 3) {
                uvColor = "blue";
            }
            else if (uvIndex >= 3 && uvIndex <= 5) {
                uvColor = "yellow";
            }
            else if (uvIndex >= 6 && uvIndex <= 7) {
                uvColor = "orange";
            }
            else if (uvIndex >= 8 && uvIndex <= 10) {
                uvColor = "red";
            }
            else {
                uvColor = "violet";
            }
            var uvDisplay = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvDisplay.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + uvColor)).text(uvIndex));
            cardDiv.append(uvDisplay);
            console.log(response)

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    //Getting five day forcast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=a1eb1ea93b53f1fa62f95489bb5aae8b&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var newrow = $("<div>").attr("class", "forecast");
        $("#weatherforecast").append(newrow);

        //Looping through array response. 
        // Displaying 5 Cards with info needed.
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);
                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);
                var cardHead = $("<div>").attr("class", "card-header bg-primary text-white").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);
                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);
                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);
                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}
// Clear previous city and weather.
function clear() {
    //Clear all the weather.
    $("#weatherforecast").empty();
}

//Save city in list and convert it to string and store it to localstorage.
function saveLocation(location){
    //Add this to the saved locations array
    if (savedLocations === null) {
        savedLocations = [location];//try todo push
    }
    else if (savedLocations.indexOf(location) === -1) {
        savedLocations.push(location);
    }
    //Save the new array to localstorage
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
   // Css functionality
    showPrevious();
}

$("#searchicon").on("click", function () {
    event.preventDefault();
    //Getting the input value.
    var location = $("#searchresult").val().trim();
    //If Location wasn't empty clear previous forecast
    if (location !== "") {
        clear();
        currentLocations = location;
        //Save location in the local storage with some css functionality
        saveLocation(location);
        //Clear the search value
        $("#searchresult").val("");
        getCurrent(location);
    }
});

// Clear search history on click
$(document).on("click", "#clearsearch", "#loc-btn", function () {
    localStorage.removeItem("weathercities");
    savedLocations = [];
    $("#oldSearches").empty();
    
 } );

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLocations = $(this).text();
    showPrevious();
    getCurrent(currentLocations);
});

initialize();










