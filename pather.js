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

function setShapes(newRoute,tripData){
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
	
	var longestTrip = tripData["B20140608WKD_001150_A..S74R"]//maxLen(tripData);
	healWithLongestTrip(segmentsArr,longestTrip,realStops);
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
		paths.data(featureCollection.features)
				.enter().append("path")
				.attr("id",function(d){ 
				var str;
				if(d.start.properties.station_name.indexOf("junction") >=0 &&
					d.end.properties.station_name.indexOf("junction") >=0){
					str = "route_"+d.properties.route_id+"_s_"
					+d.start.properties.stop_ids[0]+"_e_"+d.end.properties.stop_ids[0];	
					}
				else if(d.start.properties.station_name.indexOf("junction") >=0){
					str =  "route_"+d.properties.route_id+"_s_"
					+d.start.properties.stop_ids[0]+"_e_"+d.end.properties.stop_ids[0].substring(0,3);
				}
				else if(d.end.properties.station_name.indexOf("junction") >=0){
					str = "route_"+d.properties.route_id+"_s_"
					+d.start.properties.stop_ids[0].substring(0,3)+"_e_"+d.end.properties.stop_ids[0];
				}
				else{
					str = "route_"+d.properties.route_id+"_s_"
					+d.start.properties.stop_ids[0].substring(0,3)+"_e_"+d.end.properties.stop_ids[0].substring(0,3);
				}
				return str;
				
				})


				.style("stroke",function(d){
					return "#888888";
					})
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
				var d = distance(coor,stopcoor);
				if(d === 0){
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
		    for(var i = 0; i < len; i++){			
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
		    	if(i<len-1){
		    		obj["end"] = realStops[i+1];
		    		graph.addEdge(obj.start.properties.stop_ids[0].substring(0,3),obj.end.properties.stop_ids[0].substring(0,3));
		    	}
		    	else
		    		obj["end"] = {'type':'Feature','properties':{'station_name':realStops[i].properties.station_name , 'stop_ids':['end','end']}, 'geometry':realStops[i].geometry};
		    	routeSegments.features.push(obj);
		    }
		    
		   // var mls = {'type':'Feature','properties':newRoute.properties, 'geometry':{'type':'MultiLineString', 'coordinates':lines}}; 
		    

		    
		    
		    return routeSegments;
		}

		function mendPath(firstStop,newStop,segments,index){
			var start = firstStop;
			var segment1 = getSegment(firstStop,segments);
			var linestring;
			segments[segment1].features.forEach(function(line){
				if(line.start.properties.stop_ids[0].substring(0,3) === start.substring(0,3))
					linestring = line;
			});
				start = linestring.start; 
				if(linestring.geometry.coordinates.length > 0){
				var end = linestring.end;
				var array = linestring.geometry.coordinates;
				var s = 0;
				var j = index;
				var e = array.length;
				var range = array.slice(s,j); 
				var line1 = {type:'Feature',geometry:{coordinates:range,type:'LineString'},properties:newRoute.properties,
							start:start,end:newStop.start};
				segments[segment1].features.push(line1);

				graph.addEdge(start.properties.stop_ids[0].substring(0,3),newStop.start.properties.stop_ids[0]);

				var range2 = array.slice(j,e);
				var line2 = {type:'Feature',geometry:{coordinates:range2,type:'LineString'},properties:newRoute.properties,
							start:newStop.start,end:end};
				segments[segment1].features.push(line2); 

				graph.addEdge(newStop.start.properties.stop_ids[0],end.properties.stop_ids[0].substring(0,3));
			}
		}
		function healWithLongestTrip(segments,longestTrip,realStops){
				console.log(longestTrip);
				var len = longestTrip.length;
				var newFeatures = [];
				for(var i = 0; i < len-1; i++){
					var endStop;
					seg1 = getSegment(longestTrip[i].stop_id,segments);         		//get segment of the first stop
					seg2 = (i<len-1)? getSegment(longestTrip[i+1].stop_id,segments) : seg1;     //get segment of the second stop
					
					if(seg1 != seg2){		//if they are not on the same segment: join segments
					console.log(segments[seg1],segments[seg2]);
						var endStop;
						realStops.forEach(function(d){
						
						if(d.properties.stop_ids[0].substring(0,3) === longestTrip[i+1].stop_id.substring(0,3) )
							endStop = d;
						});


						var stopid1 = longestTrip[i].stop_id, stopid2 = longestTrip[i+1].stop_id;
						var id1 = stopid1.substring(0,3),id2 = stopid2.substring(0,3)
						//var lineStringAfterCurStop = searchStarts(longestTrip[i],segments[seg1]);
						var pair = findClosestPair(segments[seg1],segments[seg2]);
						var index = pair[2];
						
						var feature = {type:'Feature', geometry:{coordinates:pair,type:'LineString'},properties:newRoute.properties,
										start:{geometry:{coordinates:pair[0],type:'Point'}, properties:{routes:[segments[seg1].properties],station_name:'junction_'+id1+'_'+id2,stop_ids:[id1+'_'+id2],stop_id:id1+'_'+id2}, type:'Feature'},
										end:endStop/*{geometry:{coordinates:pair[1],type:'Point'}, properties:{routes:[segments[seg2].properties],station_name:'junction_'+id2+'_'+id1,stop_ids:[id2+'_'+id1],stop_id:id2+'_'+id1}, type:'Feature'}*/    }
						Stops.push(feature.start);
						mendPath(stopid1,feature,segments,index);//add a path on each side of the junction to bridge
						//Stops.push(feature.end);
						//newFeatures.push(feature.end);
						graph.addEdge(feature.start.properties.stop_ids[0],feature.end.properties.stop_ids[0].substring(0,3));
						//segments[seg1].features.push(feature);
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
