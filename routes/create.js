var express = require('express');
var router = express.Router();
var http = require("http");

// Creates a cycling-route entry that was sent from the mobile application.
router.post('/fromapp/', function(req, res) {
    var response = [];

    // parse Post-String from the app into JSON Object.
    var routesData;
    try {
        console.log(req.body.User);
        routesData = JSON.parse(req.body.User);
    } catch (e) {
        console.log(e.message);
        console.log('Input causing error: ' + req.body.User);
        res.json({response : { code : "400", status : "ERR PARSING INPUT DATA" }});
        return;
    }
    routesData.forEach(function(routeData) {
        // Get the location of the route via Google reversed geo API.
        // Initialising variables that may or may not be provided by the API
        var country = '';
        var country_code = '';
        var administrative_area_level_1 = '';
        var administrative_area_level_2 = '';
        var administrative_area_level_3 = '';
        var locality = '';
        var postal_code = '';
        
        // Sending request to the Google API and storing values.
        var geocoder = require('geocoder');
        geocoder.reverseGeocode(routeData[0].latitude, routeData[0].longitude, function ( err, data ) {
            if (err) {
                console.log("Error accessing Google Geo API: " + err.message);
            } else {
                var addrComponents = data.results[0].address_components;
                
                for (var i = 0; i < addrComponents.length; i++) {
                    var types = addrComponents[i].types[0];
                    
                    if (types == "country") {
                        country = addrComponents[i].long_name.toLowerCase();
                        country_code = addrComponents[i].short_name.toLowerCase();
                    } else if (types == "administrative_area_level_1") {
                        administrative_area_level_1 = addrComponents[i].long_name.toLowerCase();
                    } else if (types == "administrative_area_level_2") {
                        administrative_area_level_2 = addrComponents[i].long_name.toLowerCase();
                    } else if (types == "administrative_area_level_3") {
                        administrative_area_level_3 = addrComponents[i].long_name.toLowerCase();
                    } else if (types == "locality") {
                        locality = addrComponents[i].long_name.toLowerCase();
                    } else if (types == "postal_code") {
                        postal_code = addrComponents[i].long_name.toLowerCase();
                    }
                }
            
                /*console.log('country: '+country.toLowerCase());
                console.log('administrative_area_level_1: '+administrative_area_level_1.toLowerCase());
                console.log('administrative_area_level_2: '+administrative_area_level_2.toLowerCase());
                console.log('administrative_area_level_3: '+administrative_area_level_3.toLowerCase());
                console.log('locality: '+locality.toLowerCase());
                console.log('postal_code: '+postal_code.toLowerCase());*/
           } 
            
            // Bring gps and date in proper format
            var coordinates = [];
            var timestamps = [];
    
            routeData.forEach(function(item) {
                coordinates.push({latitude:item.latitude,longitude:item.longitude});
                timestamps.push(new Date(item.date));
            });
            
            // Get the Mongoose BikeTrack Model for DB access and save the cycling data.
            var BikeTrack = require('../model/biketrack');
            
            var saveRoute = new BikeTrack({
                coordinates : coordinates,
                timestamps : timestamps,
                country : country,
                country_code : country_code,
                administrative_area_level_1 : administrative_area_level_1,
                administrative_area_level_2 : administrative_area_level_2,
                administrative_area_level_2 : administrative_area_level_3,
                locality : locality,
                postal_code : postal_code
            });
            
            saveRoute.save(function (err, data) {
                if (err) {
                    console.log('Error while saving: ' + err.message);
                    response.push({ code : "400", status : "ERR DB SAVING" });
                    //res.json({response : );
                } else {
                    console.log('Route saved. Started in' + data.administrative_area_level_1 + '/' + administrative_area_level_2 + '/' + administrative_area_level_3 + '/' + country + ' at ' + timestamps[0]);
                    //res.json({response : { code : "20O", status : "OK" }});
                    response.push({ code : "20O", status : "OK" });
                }
            });
        }, { language: 'en' });
    });
    res.json(response);
});

module.exports = router;