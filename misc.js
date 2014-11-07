//Random code 
/*function cleanRoutes(routesGeo){

	routesGeo.features.map(function(route){

		if(typeof route.geometry != 'undefined' && route.geometry != null){
			if(route.geometry.type == 'MultiLineString'){
				var max = route.geometry.coordinates[0].length;
				var keep = route.geometry.coordinates[0];
				for(array in route.geometry.coordinates){
					if( array.length > max){
						max = array.length();
						keep = array;
					}
				}

				route.geometry.coordinates = [ union(route.geometry.coordinates)  ];
			}
		}

	})

}*/

/*function union(arrays){
	if(arrays == null || arrays.length == 0) //if we are given an empty list of arrays we return an empty array
		return [];
	var curunion = [];
	for(var i = 0; i<arrays.length; i++){// for every array in the list of arrays
		for(var j = 0; j< arrays[i].length; j++){ // for every element in the array
			if(!arrayExists(curunion,arrays[i][j] ) ) // if the element is in the current union 
				curunion.push(arrays[i][j]);         // add the element to the union.
		}
	}
	return curunion;
}

function arrayExists(array,subarray){
	var bool = array.every(function(element,index,array){
		return !areEqual(element,subarray);
	})
	return !bool;
}

function areEqual(array1, array2){
//assume similar structured array
	if(array1.length  != array2.length)
		return false;

	for(ind in array1){
		if(array1[ind] != array2[ind])
			return false;
	}	
	return true;
}*/

/*var newJson = {type:'FeatureCollection',features:[]};
	GeoData.objects.routes.geometries.forEach(function(d){
		var routeSwap = {type: "GeometryCollection", geometries:[d]}
		var test = topojson.mesh(GeoData, routeSwap, function(a, b) { return true; });
		console.log(test,d.properties);
		var feature = {type:'Feature', properties:d.properties, geometry:{type:test.type, coordinates:test.coordinates}};
		newJson.features.push(feature);
	})*/


		newRoute.geometry.coordinates.forEach(function(lineString,stringIndex){
			lineString.forEach(function(coorpair){
				addAndParseSegments(newRoute.stops,coorpair,stringIndex,newRoute.properties)
			})
		})
		console.log(newRoute);
		newRoute.stops.forEach(function(stop){
			
			// if( !("lineGeometry" in stop) ){
			// 	stop.lineGeometry = {"type":"Feature", "geometry":{"type":"MultiLineString","coordinates":[]}, "properties":{}, 
			// 	"numlines":1,"lastLine":-1}
			// }
			// routeSegments.features.push(stop.lineGeometry);
			
			// stop.lineGeometry.geometry.coordinates.forEach(function(arr){
			// 	count += arr.length;
			// });
		})
		
		// console.log(count);
		d3.select("#plot").selectAll("path").data(routeSegments.features)
					.enter().append("path")
					.attr("id",function(d){return "route_"+d.properties.route_id;})
					.style("stroke",function(d){return "#"+d.properties.route_color;})
					.attr("d",path); 


	
	// function addandParseSegments(stops,coorpair,stringIndex,properties){
	// 	var distances = [];
	// 	stops.forEach(function(stop,index) {
	// 		var info = {"i":index, "dist": distance(stop.geometry.coordinates,coorpair)};
	// 		distances.push(info);
	// 	})
	// 	var min = d3.min(distances,function(d){return d.dist;})
	// 	var index = 0;
	// 	distances.forEach(function(d){
	// 		if(d.dist == min)
	// 			index = d.i;
	// 	})
		
		
	// 	if( !("lineGeometry" in stops[index]) ){
	// 		stops[index].lineGeometry = {"type":"Feature", "geometry":{"type":"MultiLineString","coordinates":[]}, "properties":properties, 
	// 		"numlines":1,"lastLine":stringIndex};
	// 	}
	// 	if(stringIndex !== stops[index].lineGeometry.lastLine){
	// 		stops[index].lineGeometry.lastLine = stringIndex;
	// 		stops[index].lineGeometry.numlines += 1;
	// 	}
	// 	curline = stops[index].lineGeometry.numlines - 1;
	// 	if(typeof stops[index].lineGeometry.geometry.coordinates[curline] === 'undefined'){
	// 		stops[index].lineGeometry.geometry.coordinates[curline] = [];
	// 	}
	// 	stops[index].lineGeometry.geometry.coordinates[curline].push(coorpair);
	// 	stops[index].lineGeometry.properties.stop_id = stops[index].properties.stop_id;
	// }