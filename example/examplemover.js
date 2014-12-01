//plotter
var TheRoute;
var updateTripObj;
var tripStart;
var getJunctions;
var theIntervals;
var tripRanges;
function getTrip(member,StartID){
	var startStation = d3.select("#plot");
	var trip = startStation.append("circle")
	.attr("class","trip")
	.attr("id",member)
	.attr("r","4")
	.attr("transform",d3.select("#station_"+StartID).attr("transform"));
	if(member == "B20140608WKD_002950_A..S74R"){
		trip.attr("r",'6')
		.style('color','green')
		.style('opacity',"0.5");
		
	}
}

function parseTime(s) {
   	  var formatTime = d3.time.format("%X");
	  var t = formatTime.parse(s);
	  if (t != null && t.getHours() < 5) t.setDate(t.getDate() + 1);
	  return t;
}



function moveTrip(value,map,intervals){
	var interval;
	var intervalList = {};
	var currentTrips = [];
	var keys = Object.keys(tripRanges);
	keys.forEach(function(id){
		if(parseTime(tripRanges[id].begin) <= value && value <= parseTime(tripRanges[id].end)){
			currentTrips.push(id);
		}
	})
	console.log(currentTrips);
	currentTrips.forEach(function(id){
		for(var i =0; i< intervals[id].length; i++){
			if(parseTime(intervals[id][i].start) <= value && value <= parseTime(intervals[id][i].stop) )
				intervalList[id] = intervals[id][i];
		}
	 })
	if(intervalList){
		var trips = d3.select("#plot").selectAll(".trip").data(currentTrips);
		trips.enter().insert("circle")
		trips.attr("class","trip")
		trips.attr("id",function(d){return d;})
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
			else
				console.log("shouldn't be moving");
		});
	}
}

function getInitialTrips(Intervals){
	var tripArray; 
}

function setTrip(tripData,Element,froute,trip_id,trip_id2){
	// console.log(tripData);
	TheRoute = froute;
	getJunctions = findJunctions(TheRoute);
	var TestTrip = tripData[trip_id]
	var TestTrip2= tripData[trip_id2];
	
	
	start = TestTrip[0].arrival_time;
	end = TestTrip2[TestTrip2.length-1].arrival_time;
	var intervals = getAllRouteIntervals(tripData,TheRoute,"route_A");
	tripRanges = getTripRanges(tripData);
	console.log(tripRanges);
	//getTrip(trip_id,TestTrip[0].stop_id);
	//getTrip(trip_id2,TestTrip2[0].stop_id);
	buildSlider(Element,"00:00:00","12:00:00",intervals());

}

function getTripRanges(tripData){
	var keys = Object.keys(tripData);
	var ranges = {}
	keys.forEach(function(id){
		var current = tripData[id];
		ranges[id] = {begin:current[0].departure_time,end:current[current.length-1].arrival_time}
	})
	return ranges;
}

function findStop(stopPrefix){
	for(var i =0; i< Stops.length; i++){
		if(Stops[i].properties.stop_id.substring(0,3) === stopPrefix)
			return i;
	}
	return -1;
}

function getAllRouteIntervals(TripData,RouteData,route_id){
	var keys = Object.keys(TripData);
	var tripIntervals = {};
	keys.forEach(function(id){
		tripIntervals[id] = getIntervals(TripData[id],RouteData,route_id)();
	})
	return function(){return tripIntervals};

}

var TimeObj = function(){
		this.start_id='';
		this.stop_id = '';
		this.start='';
		this.stop = '';
		this.lineID = '';
		this.lineClass='';
	}



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
			var realRoute = bfs(graph,timeObj.start_id,timeObj.stop_id);
			
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



//Best option might be to have a graph datastructure and then a method that 
//will convert the datastructure to a FeatureColllection after initial processing.