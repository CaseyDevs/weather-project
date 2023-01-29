// Modules
const express = require("express")
const bodyParser = require("body-parser")
const request = require("request");
const rateLimit = require("express-rate-limit")
const app = express()

// Configure dotenv package
require("dotenv").config()

// Limit request to 1 second per request
const limiter = rateLimit({
	windowMs: 1000, // 1 second
	max: 2, // limit each IP to 1 requests per windowMs
})

// Use public directory to server static pages, acting as root directory
app.use(express.static(__dirname + "/public"))

// Enable use of body parsing
app.use(bodyParser.urlencoded({extended: true}))

// Use limiter on all
app.use(limiter)

// Set the view engine to EJS
app.set("view engine", "ejs")

// *** Displays ***

// Index page
app.get("/", (req, res) => {
    res.render("pages/index", { weather: null, error: null})
})

// About page
app.get("/about", (req, res) => {
    res.render("pages/about")
})

// *** Post request display ***

app.post("/", (req, res) => {  
    const city = req.body.city // Get city name passed from form input

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.API_KEY}`

    // *** Request data from the API ***

    request(url, (err, response, body) => {

        // Check if JSON data is fetched successfully on return
        if (err) {
            res.render("pages/index", {weather: null, error: 'Error fetching the correct data, try again...'})
        } else {
            const weather = JSON.parse(body)
        
            // *** Check if any API data is returned undefined ***
            if (weather.main == undefined) {
                res.render("pages/index", {weather: null, error: "Could not find data for this location, please try again..."})
            } else {
                // Use recieved data for output
                const place = weather.name
                const weatherTemp = roundTemp(weather.main.temp) + "°"
                const weatherPressure = weather.main.pressure
                const weatherIcon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
                const weatherDesctiption = weather.weather[0].description
                let splitWeatherDescription

                // Capitalise each word in weather description if description contains a space
                if (weatherDesctiption.includes(" ")) {
                    splitWeatherDescription = weatherDesctiption.split(" ")

                    for (let i = 0; i < splitWeatherDescription.length; i++) {
                        splitWeatherDescription[i] = splitWeatherDescription[i][0].toUpperCase() + splitWeatherDescription[i].substr(1)
                    }

                    splitWeatherDescription = splitWeatherDescription.join(" ")

                } else {
                    splitWeatherDescription = weatherDesctiption
                    splitWeatherDescription[0].toUpperCase()
                }

                const humidity = weather.main.humidity
                const clouds = weather.clouds.all
                const visibility = weather.visibility
                const main = weather.weather[0].main

                // Rounds temperature to 2 decimal places using exponents
                function roundTemp (number) {
                    return +(Math.round(number))
                }

                // *** Render values to the webpage, generating a static page which is displayed to the user

                res.render("pages/index", {
                    weather: weather,
                    place: place,
                    temp: weatherTemp,
                    pressure: weatherPressure,
                    icon: weatherIcon,
                    description: splitWeatherDescription,
                    humidity: humidity,
                    clouds: clouds,
                    visibility: visibility,
                    main: main,
                    error: null,
                })
            }
        }
    })
    
})

// *** Port ***
app.listen(process.env.PORT || 3000)