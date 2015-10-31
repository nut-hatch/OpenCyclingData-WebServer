var express = require('express');
var router = express.Router();

// Fetches tracks from the DB according to the search parameters.
router.get('/search', function(req, res) {

    var country = req.query.country;
    var region = req.query.region;
    var year = req.query.year;
    var month = req.query.month;
    var day = req.query.day;
    var limit = req.query.limit;

    var params = {};
    var arrParams = [];
    
    // specific country
    if (typeof country != 'undefined') {
        arrParams.push({ $or: [{country: country.toLowerCase()}, {country_code: country.toLowerCase()}] });
    }
    
    //specific region
    if (typeof region != 'undefined') {
        arrParams.push({ $or: [{administrative_area_level_1: region.toLowerCase()}, {administrative_area_level_2: region.toLowerCase()}, {administrative_area_level_3: region.toLowerCase()}] });
    }
    
    if (typeof year != 'undefined') {
        var startDate;
        var endDate;
        if (typeof month != 'undefined') {
            //specific day in a month of a year
            if (typeof day != 'undefined') {
                startDate = new Date(year, month-1, day);
                endDate = new Date(year, month-1, day);
                endDate.setDate(startDate.getDate()+1);
            } else {
                //specific month in a year
                startDate = new Date(year, month-1);
                endDate = new Date(year, month);
            }
        } else {
            //specific year
            var intYear = parseInt(year);
            startDate = new Date(year);
            intYear = intYear+1;
            endDate = new Date(intYear.toString());
        }
        //params.timestamps = {"$gte": new Date(year, month-1, day), "$lt": new Date(year, month-1, day+1)};
        arrParams.push({timestamps : {"$gte": startDate, "$lt": endDate}});
    }
    
    if (arrParams.length > 0) {
        params.$and = arrParams;
    }
    
    //console.log(params);
    
    // Mongoose Model for DB access
    var BikeTrack = require('../model/biketrack');
    
    // Get data from DB and send response
    BikeTrack.find(params).limit(limit).exec(function(error, data) {
        if (error) {
            console.log(error);
            res.json("Internal Error Occured.");
        } else {
            //console.log(data);
            if (req.query.geojson == 'true') {
                
                res.setHeader('Access-Control-Allow-Origin', '*' );
                
                var geojson = {};
                geojson.type = "FeatureCollection";
                geojson.features = [];
                
                data.forEach(function(routeTrack) {
                    var feature = {};
                    feature.type = "Feature";
                    
                    feature.geometry = {};
                    
                    feature.geometry.type = "LineString";
                    
                    feature.geometry.coordinates = [];
                    routeTrack.coordinates.forEach(function(routeCoordinates) {
                        feature.geometry.coordinates.push([routeCoordinates.latitude, routeCoordinates.longitude]);
                    });
                    
                    geojson.features.push(feature);
                });
                
                res.json(geojson);
            } else if (req.query.coordinates == 'true') {
                var coordinates = [];
                data.forEach(function(routeTrack) {
                    routeTrack.coordinates.forEach(function(coordinate) {
                        coordinates.push([coordinate.latitude, coordinate.longitude]);
                    });
                });
                res.json(coordinates);
            } else {
                res.json(data);
            }
        }
    });

});

// Check parameters and redirect to /search
router.get('/:datarequest/:country/:region?', function(req, res) {

    var country = req.params.country;
    var region = req.params.region;
    var datarequest = req.params.datarequest;
    
    var year = req.query.year;
    var month = req.query.month;
    var day = req.query.day;
    var limit = req.query.limit;
    
    // Build parameter string for redirect
    var paramStr = '?country=' + country;
    if (datarequest == 'geojson') {
        paramStr += '&geojson=true';
    } else if (datarequest == 'coordinates') {
        paramStr += '&coordinates=true';
    }
    if (typeof region != 'undefined') {
        paramStr += '&region=' + region;
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
    if (typeof limit != 'undefined') {
        paramStr += '&limit=' + limit;
    }

    res.redirect('/biketracks/search'+paramStr);
    
});

module.exports = router;