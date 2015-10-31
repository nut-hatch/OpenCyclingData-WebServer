var express = require('express');
var router = express.Router();
var request = require("request");

router.get('/favicon.ico', function(req, res) {
});

// Route for displaying the heat mpa
router.get('/:country?/:region?', function(req, res) {
    // read request parameters
    var region = req.params.region;
    var country = req.params.country;
    var year = req.query.year;
    var month = req.query.month;
    var day = req.query.day;

    // parse parameters to build request string for
    // Google Map API and
    var searchStr = '';
    // Open Cycling Data API
    var paramStr = '';
    if (typeof region != 'undefined') {
        searchStr += region + ' ';
        paramStr += '&region=' + region;
    }
    if (typeof country != 'undefined') {
        searchStr += country;
        paramStr += '&country=' + country;
    }
    if (typeof year != 'undefined') {
        paramStr += '&year=' + year;
    }
    if (typeof month != 'undefined') {
        paramStr += '&month=' + month;
    }
    if (typeof day != 'undefined') {
        paramStr += '&day=' + day;
    }

    // Sending GET request to Open Cycling Data API
    request({
        uri: "https://lutcodecamp-niklaskolbe.c9.io/biketracks/search?coordinates=true" + paramStr,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {
        // LUT is the default if no region was specified
        var coords = [61.04767,28.09706];
        if (error) {
            console.log("Error while fetching GPS data from Open Cycling Data.");
            console.log(error.message);
            res.render('index', {title: 'Open Bike Data', heatmapData: {}, mapCenter: coords});
            return;
        } else {
            // if a region was specified, requesting the corresponding coordinates to centre the map later
            var geocoder = require('geocoder');
            if (searchStr != '') {
                geocoder.geocode(searchStr, function ( err, data ) {
                    if (err) {
                        console.log("Error accessing Google Geo API: " + err.message);
                    } else {
                        try {
                            coords = [data.results[0].geometry.location.lat,data.results[0].geometry.location.lng];
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    res.render('index', {title: 'Open Bike Data', heatmapData: body, mapCenter: coords});
                });
            } else {
                res.render('index', {title: 'Open Bike Data', heatmapData: body, mapCenter: coords});
            }
        }
    });
});
module.exports = router;
