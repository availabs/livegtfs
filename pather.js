//pather.js

function getPathCollection(routes,stations){
	var pathCollection = []

	routes.forEach(function(d,i,array){  //for each route
		var pathElement = {pathID:d.properties.route_id, stations: []} //create a element for the collection
		stations.forEach(function(station,i,array){   //search through the stations 
			if(station.properties.routes[0] == d.properties.route_id)             //if one has the same id
				pathElement.stations.push(station);   //add it to the element list
		})
		pathCollection.push(pathElement);			 //add the current element to the collection
	})
	return pathCollection
}

function getStops(route_id, Routes,pathCollection){
	var curRoute;
	Routes.forEach(function(route){
		if(route.properties.route_id == route_id)
			curRoute = route;
	})

	var stops = [];
	pathCollection.forEach(function(path){
		if(path.pathID == route_id)
			stops = path.stations;
	})

	curRoute["stops"] = stops;
	return curRoute;
}

function setShapes(newRoute){
	var currentBin,index;

	var stopSet = [];
	
	console.log('stopSet',stopSet);
	var routeSegments = {
		type:'FeatureCollection',
		features:[]
	};
	var splitList = [];
	newRoute.stops.forEach(function(stop){
		var coorList = [];
		var closest = []
		
		newRoute.geometry.coordinates.forEach(function(lineString,stringIndex){
			
			lineString.forEach(function(coors,index){

				var info = {'si':stringIndex,"i":index,'dist':distance(stop.geometry.coordinates,coors)}
				closest.push(info);


			})

		})
		var min = d3.min(closest,function(d){ return d.dist; });
		var indexes = {};
		
		closest.forEach(function(d){
			if(d.dist === min){
				indexes = d;
			}
		})
		console.log('indexes of closest point to stop',stop.properties.stop_name,indexes)
		indexes.stop = stop.properties.stop_id;
		splitList.push(indexes)
	});
		var lines = []
	    var i = 0;
	   	var realStops = []
	   	newRoute.stops.forEach(function(d,i){
	   		if(i%2 === 0)
	   			realStops.push(d)
	   	})

	    for(var i = 0; i <= 7; i++){
	    	var s1 = realStops[i].geometry.coordinates;
	    	var array = newRoute.geometry.coordinates[1];
	    	var s2 = (i<7)? realStops[i+1].geometry.coordinates : array.length;
	    	var stop1 = findStop(s1,array)
	    	var stop2 = findStop(s2,array);
	    	var range;
	    	if(stop1 < stop2){
	    		array.reverse();
	    		stop1 = findStop(s1,array);
	    		stop2 = findStop(s2,array);	
	    	}
	    	range = getRange(array,stop1,stop2);
	    	console.log(stop1,stop2)

	    	if(range.length !== 0)
	    		lines.push(range);
	    }
	    console.log(lines);
	
	
	

	function getRange(array,start,stop){
		if(start < 0){
			start = 0;
		}
		retArray = [];
		for( var i=start; i < stop; i++){
			retArray.push(array[i]);
		}
		return retArray;
	}
	function findStop(stopcoor,lineString){
		var index = -1;
		lineString.forEach(function(coor,i){
			if(distance(coor,stopcoor) === 0){
				index = i;
				
			}

		})
		return index;
	}

	function distance(a,b){
		return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) )
	}
}

