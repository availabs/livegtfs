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

function setShapes(newRoute,tripData){
	var currentBin,index;

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
		//console.log('indexes of closest point to stop',stop.properties.stop_name,indexes)
		indexes.stop = stop.properties.stop_id;
		splitList.push(indexes)
	});

	var realStops = getStations(newRoute.stops);
	


	// routeSegments  = getLines(newRoute.geometry.coordinates[0],realStops);
	// routeSegments2 = getLines(newRoute.geometry.coordinates[1],realStops);
	// routeSegments3 = getLines(newRoute.geometry.coordinates[2],realStops);
	// routeSegments4 = getLines(newRoute.geometry.coordinates[3],realStops);	
	// var segmentsArr  = [routeSegments,routeSegments2,routeSegments3,routeSegments4];
	var segmentsArr = getAllLines(newRoute.geometry,realStops);
	console.log(segmentsArr)
	
	var longestTrip = maxLen(tripData);
	healWithLongestTrip(segmentsArr,longestTrip);
	routeSegments = mergeSegments(segmentsArr);
	plotNewRoute(routeSegments);
	//toMultiLineString
	 return routeSegments;

	 function maxLen(tripData){
		var longestTrip;
		var len = -Infinity
		for(var i in tripData){
			var trip = tripData[i];
			if(undefined !== trip && trip instanceof Array )
			{
				if(trip.length > len){
					longestTrip = trip;
					len = trip.length;
				}
			}
		} 	
		return longestTrip;
	 }

	function mergeSegments(SegmentList){
		var mergedFeatureCollection = {
			type:'FeatureCollection',
			features:[]
		};
		SegmentList.forEach(function(d){
			d.features.forEach(function(feature){
				mergedFeatureCollection.features.push(feature);
			})
		})
		return mergedFeatureCollection
	}
	function toMultiLineString(FeatureCollection){
		var features = FeatureCollection.features;
		var mlsObj = {geometry:{coordinates:[]},type:"MultiLineString"};
		features.forEach(function(feature){
			mlsObj.geometry.coordinates.push(feature.geometry.coordinates);
		})
		return mlsObj;
	}

	function getAllLines(MultiLineString,stops){
		var LIST = []
		MultiLineString.coordinates.forEach(function(d){
			if(d.length != 0)
				LIST.push(getLines(d,stops));
		})
		//var collection = mergeSegments(LIST);
		return LIST;
	}
	function plotNewRoute(featureCollection){
		d3.select("#plot").selectAll("path").data(featureCollection.features)
				.enter().append("path")
				.attr("id",function(d){ return "route_"+d.properties.route_id+"_s_"
					+d.start.properties.stop_ids[0].substring(0,3)+"_e_"+d.end.properties.stop_ids[0].substring(0,3);
					;})
				.style("stroke",function(d){return "#"+d.properties.route_color;})
				.attr("d",path); 			
	}

	   

		
	function getStations(stops){
		var uniqueStations = [];
		var exists = false;
		for(var i = 0; i< stops.length; i++){
			var station = {'type':'Feature','properties':{'station_name':'' , 'stop_ids':[]}, 'geometry':stops[i].geometry};
			for(var j=0; j< uniqueStations.length; j++){
				exists = false;
				if(uniqueStations[j].properties.station_name === stops[i].properties.stop_name){
					uniqueStations[j].properties.stop_ids.push(stops[i].properties.stop_id)
					exists = true;
					break;
				}
			}
			if(!exists){
				station.properties.station_name = stops[i].properties.stop_name;
				station.properties.stop_ids.push(stops[i].properties.stop_id);
				uniqueStations.push(station);
			}
			
		}
		return uniqueStations;
	}
	

	function getRange(array,start,stop){
		if(start < 0){
			start = 0;
		}
		retArray = [];
		for( var i=start; i <= stop; i++){   //must enclude endpoints if it needs to interpolate!!!!!!
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

	function getSet(lineString,realStops){
	   		var listOfStops = [];
	   		realStops.forEach(function(d){
	   			if(findStop(d.geometry.coordinates,lineString) >= 0)
	   				listOfStops.push(d);
	   		})
	   		return listOfStops;
	   	}

		function getLines(lineString, realStops){
		
			realStops = getSet(lineString,realStops);
			
			var routeSegments = {
			type:'FeatureCollection',
			features:[]
			};

			var lines = []     						//array of linestrings
		    var i = 0;								
		    var len = realStops.length;
		    										//get initial points
		    for(var i = 0; i < len; i++){			//for now only worry about the first line string
		    	var s1 = realStops[i].geometry.coordinates;						//get coordinates from first stop
		    	var array = lineString;					//get only the first line string
		    	var s2 = (i<len-1)? realStops[i+1].geometry.coordinates : array.length;	//get next stops coordinates
		    	var stop1 = findStop(s1,array)									//find first stop on the linestring
		    	var stop2 = findStop(s2,array);									//find second stop on the line string
		    	var range;		
		    	if(stop1 > stop2){							//if stop1 occurs before stop2								
		    		array.reverse();						//reverse the array
		    		stop1 = findStop(s1,array);				//find their new indexes
		    		stop2 = findStop(s2,array);	
		    	}
		    	range = getRange(array,stop1,stop2);		//get the range of points between the two stops on line string
		    	if(range.length !== 0)						//if there is anything in the range 
		    		lines.push(range);						//add it to the list of lines
		    	var obj = {'type':'Feature','properties':newRoute.properties,'geometry':{'type':'LineString','coordinates':range},'start':realStops[i]};
		    	if(i<len-1)
		    		obj["end"] = realStops[i+1];
		    	else
		    		obj["end"] = obj.start;
		    	routeSegments.features.push(obj);
		    }
		    
		   // var mls = {'type':'Feature','properties':newRoute.properties, 'geometry':{'type':'MultiLineString', 'coordinates':lines}}; 
		    
		   console.log(realStops);
		   
		    
		    
		    return routeSegments;
		}

		function healWithLongestTrip(segments,longestTrip,stops){
			
				var len = longestTrip.length;
				var newFeatures = [];
				for(var i = 0; i < len; i++){
					
					seg1 = getSegment(longestTrip[i].stop_id,segments);         		//get segment of the first stop
					seg2 = (i<len-1)? getSegment(longestTrip[i+1].stop_id,segments) : seg1;     //get segment of the second stop
					
					if(seg1 != seg2){		//if they are not on the same segment: join segments
					// console.log(longestTrip[i].stop_id,longestTrip[i+1].stop_id)
					// console.log(seg1,seg2)
					var id1 = longestTrip[i].stop_id, id2 = longestTrip[i+1].stop_id;
						//var lineStringAfterCurStop = searchStarts(longestTrip[i],segments[seg1]);
						var pair = findClosestPair(segments[seg1],segments[seg2]);
						var feature = {type:'Feature', geometry:{coordinates:pair,type:'LineString'},properties:newRoute.properties,
										start:{geometry:{coordinates:pair[0],type:'Point'}, properties:{routes:[segments[seg1].properties],station_name:'junction_'+id1+'_'+id2,stop_ids:[id1+'_'+id2]}, type:'Feature'},
										end:{geometry:{coordinates:pair[1],type:'Point'}, properties:{routes:[segments[seg2].properties],station_name:'junction_'+id2+'_'+id1,stop_ids:[id2+'_'+id1]}, type:'Feature'}    }
						Stops.push(feature.start);
						Stops.push(feature.end);
						newFeatures.push(feature.start);
						newFeatures.push(feature.end);
						segments[seg1].features.push(feature);
						segments[seg2].features.push(feature);
					}
				}
				//console.log(newFeatures);
				d3.select("#plot").selectAll(".junction").data(newFeatures)
					.enter().append("circle")
					.attr("id",function(d){return d.properties.station_name;})
					.attr("transform",function(d){
						return "translate("+projection(d.geometry.coordinates)+")"
					})
					.attr("r","2.5")
					.style("fill","green")
					.style("stroke","black");
			
		}
		//for right now bruteforce, there is a better algorithm to do this however
		//see closest pair of points algorithm
		function findClosestPair(segment1,segment2){ 
			var minDist = Infinity
			var pair;
			segment1.features.forEach(function(d){
				segment2.features.forEach(function(ls){
					d.geometry.coordinates.forEach(function(coor1){
						ls.geometry.coordinates.forEach(function(coor2){
							var dist = distance(coor1,coor2);
							if(minDist > dist){
								minDist = dist;
								pair = [coor1,coor2];
						}
					})
					})
				})
			})
			return pair;
		}

		function searchStarts(stopId, segment){
			var end;
			segment.features.forEach(function(d,i){
				if(d.start.properties.stop_ids.indexOf(stopId)>=0 ){
					return d.geometry.coordinates;
				}
				if(d.end.properties.stop_ids.indexOf(stopId) ){
					end = d.end.geometry.coordinates;
				}
			})
			//if we didn't return anything our stop must be at the end so we return those coordinates;
			return [end];
		}

		function getSegment(stop_id,segments){
			var index;
			segments.forEach(function(segment,i){
				segment.features.forEach(function(line){
					if(line.start.properties.stop_ids.indexOf(stop_id) >=0 || line.end.properties.stop_ids.indexOf(stop_id) >= 0){
						index = i;
					}
				})
			})
			return index;
		}
}
function distance(a,b){
		return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) )
}
