//plotter
var tripRanges = {
	ranges:{},
	addRanges:function(rangeObj){
		var keys = Object.keys(rangeObj);
		var ranges = this.ranges
		keys.forEach(function(tripid){
			ranges[tripid] = rangeObj[tripid];
		})
	},
	getRanges:function(){
		return this.ranges;
	}
}

function parseTime(s) {
   	  var formatTime = d3.time.format("%X");
	  var t = formatTime.parse(s);
	  if (t != null && t.getHours() < 5) t.setDate(t.getDate() + 1);
	  return t;
}



function moveTrip(value,map,intervals){
	var intervals = intervalStructure.getIntervals();
	var interval;
	var intervalList = {};
	var currentTrips = {};
	var tripIntervalRanges = tripRanges.getRanges();
	var keys = Object.keys(tripIntervalRanges);
	var v = timeToInt(d3.time.format('%X')(value));
	segTree.queryPoint(v,function(results){
		results.forEach(function(result){
			var id = result.inter.name;
			intervalList[id] = result.inter.interval;
		})
	})
	if(intervalList){
		var activeTrips = Object.keys(intervalList);
		var trips = d3.select("#plot").selectAll(".trip").data(activeTrips);
		trips.enter().append("circle")
		trips.attr("class","trip")
		trips.attr("id",function(d){
			return correctID(d);})
		trips.attr("r","4")
		trips.exit().remove()

		trips.attr("transform",function(d){
			
			var interval = intervalList[d];
			if(interval){ 
				var path1 = d3.select("."+interval.lineClass+"#"+interval.lineID).node();

				if(path1 == null)
				{
					console.log("problems");
				}
				var l = path1.getTotalLength();   //get length of the curve
				var shift = map(parseTime(interval.start));
				var t = (map(value)-shift)/(map(parseTime(interval.stop)) - shift);   //calc % point in time interval

				var p = path1.getPointAtLength(t*l);             //find that % point along the curve
				return "translate(" + p.x+"," + p.y+")";
			}
			else{
				return d3.select("#"+correctID(d)).attr("transform");
			}
				
				

		});
	}
	function correctID(d){
		return d.replace(/\./g,'_');
	}
}



function getInitialTrips(Intervals){
	var tripArray; 
}
var segTree = segmentTree();
function timeToInt(time){
	var place = 1;
	var val = 0;
	for(var i = time.length-1; i>=0; i--){
		var d = parseInt(time[i]);
		if(!isNaN(d)){
			val += d*place;
			place = place * 10;
		}
	}
	return val;
}
var tripSetter = {
	required:0,
	count:0,
	setRequired:function(numRequired){
		this.required = numRequired;
	},
	setTrip:function(route_id,tripData,Element,froute,builtIntervals){
		var TheRoute = froute;
		//var intervals = getAllRouteIntervals(tripData,TheRoute,"route_" + route_id);
		//intervalStructure.addIntervals(tripData,TheRoute,"route_" + route_id,Stops,graph);
		intervalStructure.intervalObj = builtIntervals.intervalObj;
		var allintervals = intervalStructure.getIntervals();
		var routes = Object.keys(allintervals);
		routes.forEach(function(route){
			var trips = Object.keys(allintervals[route]);
			trips.forEach(function(trip){
				allintervals[route][trip].intervals.forEach(function(interval){
					var start = timeToInt(interval.start);
					var end = timeToInt(interval.stop);
					if(start<end){
						intervalObj = {name:trip,interval:interval};
						segTree.pushInterval(start,end,intervalObj);
					}
				})

			})
		})
		segTree.buildTree();
		//tripRanges.addRanges(getTripRanges(intervalStructure.getIntervals()));
		//console.log(intervalStructure);
		
		
		buildSlider(Element,/*start*/"06:20:00","06:30:00"/*end*//*,intervals()*/);
	},
	incCount:function(){
		this.count++;
	},
	canBuild:function(){
		return this.count == this.required;
	}
}


function getTripRanges(routeIntervals){
	var keys = Object.keys(routeIntervals);
	var ranges = {}
	keys.forEach(function(id){
		var currentRoute = routeIntervals[id];
		tripKeys = Object.keys(currentRoute);
		tripKeys.forEach(function(k) {
			ranges[k] = currentRoute[k].range;	
		})
		 
	})
	return ranges;
}

// function findStop(stopPrefix){
// 	for(var i =0; i< Stops.length; i++){
// 		if(Stops[i].properties.stop_id.substring(0,3) === stopPrefix)
// 			return i;
// 	}
// 	return -1;
// }


// function getAllRouteIntervals(tripData,RouteData,route_id){
// 	var keys = Object.keys(tripData);
// 	var tripIntervals = {};
// 	keys.forEach(function(id){
// 		tripIntervals[id] = getIntervals(tripData[id],RouteData,route_id)();
// 	})
// 	return function(){return tripIntervals};

// }

var TimeObj = function(){
		this.start_id='';
		this.stop_id = '';
		this.start='';
		this.stop = '';
		this.lineID = '';
		this.lineClass='';
	}

var intervalStructure = {
	intervalObj:{},
// 	addIntervals:function (tripData,RouteData,route_id){
// 		this.intervalObj[route_id] = getAllRouteIntervals(tripData,RouteData,route_id)();
// 	},

	getIntervals:function(){
		return this.intervalObj;
	}
}
/*
function getIntervals(oneTripsData,RouteData,route_id){
	
	var intervals = [];
	for(var i =0; i< oneTripsData.length-1; i++){
		var timeObj = new TimeObj();
		timeObj.start_id = oneTripsData[i].stop_id.substring(0,3);
		timeObj.start = oneTripsData[i].departure_time;
		timeObj.stop = oneTripsData[i+1].arrival_time;
		timeObj.stop_id = oneTripsData[i+1].stop_id.substring(0,3);
		timeObj.lineID = "_s_" + timeObj.start_id +"_e_"+timeObj.stop_id;
		timeObj.lineClass = route_id
		var stop1 = Stops[findStop(timeObj.start_id)].geometry.coordinates;
		var stop2 = Stops[findStop(timeObj.stop_id)].geometry.coordinates;

// 		if(inSameSegment(stop1,stop2)){
// 			intervals.push(timeObj);
// 		}
// 		else{
		
			var timeArr = []; //prepare an array of time objects;
			var realRoute = graph.getShortestPath(route_id.substring(route_id.indexOf('_')+1,route_id.length),
																	 timeObj.start_id,timeObj.stop_id);
			
			
			for(var j =0; j< realRoute.length-1; j++){
				var timeObja = new TimeObj();
				timeObja.start_id = realRoute[j];
				timeObja.stop_id = realRoute[j+1];
				timeObja.lineID = "_s_" + timeObja.start_id + "_e_" + timeObja.stop_id;
				timeObja.lineClass = route_id;
				timeArr.push(timeObja);
			}
			var len = timeArr.length;
			var start = parseTime(timeObj.start);
			var end = parseTime(timeObj.stop);
			var tmap = d3.time.scale().domain([0,len]).range([start,end]);
			var form = d3.time.format("%X");
			for (var j = 0; j< len; j++){
				timeArr[j].start = form(new Date(tmap(j)) );
				timeArr[j].stop = form(new Date(tmap(j+1)) );
				intervals.push(timeArr[j]);
			}
// 		}
	}

	return function(){ return intervals};
}

function play(intervals){
		var tmap = d3.time.format("%X");
		var y = d3.time.scale()
	    	.domain([parseTime("00:11:30"), parseTime("2:22:00")])
	    	.range([0, 1000])
	   	var currTime = new Date(parseTime("00:11:30"));
	   	var time = tmap(currTime);
		while(time !== "2:22:30"){
			moveTrip(time,y,intervals);
	    	setTimeout(50);
	    	currTime.setSeconds(currTime.getSeconds() + 30);
	    	time = tmap(currTime);
		}
	}*/

//Best option might be to have a graph datastructure and then a method that 
//will convert the datastructure to a FeatureColllection after initial processing.