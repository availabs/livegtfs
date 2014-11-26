//example pather.js
//pather.js
var inSameSegment;
var graph = new Graph()
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

function buildGraph(routeSegments){

	routeSegments.features.forEach(function(seg){
		graph.addEdge(seg.start.properties.stop_ids[0].substring(0,3),
						seg.end.properties.stop_ids[0].substring(0,3));
	})

}

function reverseSegments(Segments){
	var revsegs = JSON.parse(JSON.stringify(Segments));// make deep copy of segments
	revsegs.features.forEach(function(feature){
		feature.geometry.coordinates.reverse(); //reverse the ordering of the points
		var temp = feature.end;
		feature.end = feature.start;
		feature.start = temp;
	})
	return revsegs;

}
function setShapes(newRoute,tripData,trip_id){
	var currentBin,index;
	inSameSegment = compBuilder(newRoute);
	var routeSegments = {
		type:'FeatureCollection',
		features:[]
	};
	var splitList = [];
	var realStops = getStations(newRoute.stops);
	trueStops = getTrueStops(newRoute.geometry,realStops);

	var segmentsArr = getAllLines(newRoute.geometry,realStops);
	console.log(segmentsArr)
	
	//healWithLongestTrip(segmentsArr,longestTrip,realStops);
	routeSegments = mergeSegments(segmentsArr);
	//buildGraph(routeSegments);
	plotNewRoute(routeSegments);
	//toMultiLineString
	return routeSegments;


	function getTrueStops(lineStrings,stops){
		var trueStops = [];
		lineStrings.coordinates.forEach(function(d){
			var array = getSet(d,stops);
			array.forEach(function(stop){
				trueStops.push(stop);
			});
		});
		return trueStops;
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
		console.log(featureCollection);
		var plot = d3.select("#plot");
		var paths = plot.selectAll("path");
		var revFeatureCollection = reverseSegments(featureCollection);
		featureCollection.features = featureCollection.features.concat(revFeatureCollection.features);
		paths.data(featureCollection.features)
				.enter().append("path")
				.attr("id",function(d,i){ 
				
					str = "route_"+d.properties.route_id+"_s_"
					+d.start.properties.stop_ids[0].substring(0,3)+"_e_"+d.end.properties.stop_ids[0].substring(0,3);
					console.log(i,str);
				return str;
				
				})


				.style("stroke",function(d){
					return "#888888";
					})
				.attr("d",
				path
				); 			
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
			for(var i =0; i< lineString.length; i++){
				var coor = lineString[i];
					var d = distance(coor,stopcoor);
					if(d === 0){
						index = i;
						break;

					}
			}
		
		return index;
	}
	function findStopAtPoint(point,stoplist){
		var index = -1;
		stoplist.forEach(function(d,i){	
			if(distance(d.geometry.coordinates,point)===0)
				index = i; 
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
		var startIndex = findStopAtPoint(lineString[0],realStops);
		var start = realStops[startIndex];
		realStops.splice(startIndex,1); //remove the element;
		var routeSegments = {
		type:'FeatureCollection',
		features:[]
		};

		var lines = []     						//array of linestrings
		var i = 0;								
		var len = realStops.length;
												//get initial points
			var lastIndex = 0;
			for(i = 0; i< lineString.length; i++){
				var temp;
				if( (temp = findStopAtPoint(lineString[i],realStops)) >=0 ){
					var range;
					if(realStops === [])
						range = [];
					else
						range = getRange(lineString,lastIndex, i);
						lastIndex = i;
					var obj = {'type':'Feature','properties':newRoute.properties,'geometry':{'type':'LineString','coordinates':range},'start':start};
						obj['end'] = realStops[temp];
						graph.addEdge(obj.start.properties.stop_ids[0].substring(0,3),obj.end.properties.stop_ids[0].substring(0,3));
//						obj["end"] = {'type':'Feature','properties':{'station_name':start.properties.station_name , 'stop_ids':['end','end']}, 'geometry':start.geometry};	

					routeSegments.features.push(obj);   //add that path to our list of segments;
					start = realStops[temp];  //set the new starting node
					realStops.splice(temp,1); //remove it from the search list;
				}
			}
								
			return routeSegments;	
		}

		//for right now bruteforce, there is a better algorithm to do this however
		//see closest pair of points algorithm
		function findClosestPair(segment1,segment2){ 
			var minDist = Infinity
			var pair;
			segment1.features.forEach(function(d){
				segment2.features.forEach(function(ls){
					d.geometry.coordinates.forEach(function(coor1,x){
						ls.geometry.coordinates.forEach(function(coor2,y){
							var dist = distance(coor1,coor2);
							if(minDist > dist){
								minDist = dist;
								pair = [coor1,coor2,x,y];
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
		function compBuilder(newRoute){
			var segmentArr = newRoute.geometry.coordinates;
			return function(p1,p2){
				var retval = false;
				segmentArr.forEach(function(multiline){
					var p1InSegment = false;
					multiline.forEach(function(point){
						p1InSegment = (distance(p1,point) === 0) || p1InSegment;
					});
					var p2InSegment = false;
					multiline.forEach(function(point){
						p2InSegment = (distance(p2,point) === 0) || p2InSegment;

					});
					retval = (p1InSegment && p2InSegment) || retval;
				});
				return retval;
			}
		}
}
function distance(a,b){
		return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) )
}