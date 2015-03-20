var swap = function(point){
	return [point[1],point[0]];
}
var shapefetcher  = (function(){
	if(!d3){
		throw new Error({message:'This Requies D3'})
	}


	// Taken from 
	// https://github.com/mapzen/routing/blob/gh-pages/js/leaflet_rm/L.Routing.OSRM.js
	// Adapted from
	// https://github.com/DennisSchiefer/Project-OSRM-Web/blob/develop/WebContent/routing/OSRM.RoutingGeometry.js
	var decode = function(encoded, precision) {
			var len = encoded.length,
			    index=0,
			    lat=0,
			    lng = 0,
			    array = [];

			precision = Math.pow(10, -precision);

			while (index < len) {
				var b,
				    shift = 0,
				    result = 0;
				do {
					b = encoded.charCodeAt(index++) - 63;
					result |= (b & 0x1f) << shift;
					shift += 5;
				} while (b >= 0x20);
				var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
				lat += dlat;
				shift = 0;
				result = 0;
				do {
					b = encoded.charCodeAt(index++) - 63;
					result |= (b & 0x1f) << shift;
					shift += 5;
				} while (b >= 0x20);
				var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
				lng += dlng;
				//array.push( {lat: lat * precision, lng: lng * precision} );
				array.push( [lat * precision, lng * precision] );
			}
			return array;
		}

	var getPrecision = function(val){
		var strval = val.toString();
		if(strval.indexOf('.') < 0)
			return 0
		else
			return strval.split('.')[1].length -1
	}
	var getMaxPrecision = function(valList){
		val = Math.max.apply(Math,valList.map(getPrecision))
		return 6
	}
	

	var fetch = function(start,stop,callback,type){
		if(!type){
			type = 'car'
		}
		var baseUrl = 'https://osrm.mapzen.com/'+type+'/viaroute?'
						//latitiude   //longitude
		var loc1 = 'loc='+start[1]+'%2C'+start[0];
		var loc2 = 'loc='+ stop[1]+'%2C'+ stop[0];

		var route_url = baseUrl + loc1 + '&' + loc2
		var precision = getMaxPrecision(start.concat(stop));
		d3.json(route_url,function(err,data){
			if(err) console.log(err);
			if(data.status_message !== "Found route between points"){
				console.log('Error finding shapes');
			}
			var shapes = decode(data.route_geometry,precision);
			shapes = shapes.map(swap)
			callback(shapes)
		});

	}

	return {
		fetch:fetch,
	}
})();

if(typeof module !== 'undefined'){
	module.exports=shapefetcher;
}