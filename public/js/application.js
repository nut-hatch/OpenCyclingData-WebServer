function getLocation () {
    if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
    } else {
    	$(".map").text("Your browser is out of fashion, there\'s no geolocation!");
    }
}

function positionSuccess(position) {
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var acr = position.coords.accuracy;
		alert("lat: " + lat + "   lng: " + lng + "    acr: " + acr);
}

function positionError(error) {
	var errors = {
		1: "Authorization fails", // permission denied
		2: "Can\'t detect your location", //position unavailable
		3: "Connection timeout" // timeout
	};
	alert("Error:" + errors[error.code]);
}