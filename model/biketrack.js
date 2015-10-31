var mongoose = require('mongoose');

var GpsSchema = new mongoose.Schema({
    latitude : Number,
    longitude : Number
});

var bikeTrackSchema = new mongoose.Schema({
    coordinates : [{longitude: Number, latitude: Number}],
    timestamps : [Date],
    country : String,
    country_code : String,
    administrative_area_level_1 : String,
    administrative_area_level_2 : String,
    administrative_area_level_3 : String,
    locality : String,
    postal_code : String
});

module.exports = mongoose.model('BikeTrack', bikeTrackSchema);