//plotter
var TheRoute;
var updateTripObj;
var tripStart;
var getJunctions;
function getTrip(member,StartID,froute,intervals){
	var startStation = d3.select("#plot");
	startStation.append("circle")
	.attr("class","trip")
	.attr("id",member)
	.attr("r","4")
	.attr("transform",d3.select("#station_"+StartID).attr("transform"));
}

function parseTime(s) {
   	  var formatTime = d3.time.format("%X");
	  var t = formatTime.parse(s);
	  if (t != null && t.getHours() < 5) t.setDate(t.getDate() + 1);
	  return t;
}

function moveTrip(value,map,intervals){
	
	var interval;
	for(var i =0; i< intervals.length; i++){
		if(parseTime(intervals[i].start) <= value && value <= parseTime(intervals[i].stop) )
			interval = intervals[i];
		
	}
	if(interval){
		var path1 = d3.select("#"+interval.lineID).node();
		if(path1 == null)
		{
			console.log("problems");
		}
		var l = path1.getTotalLength();   //get length of the curve
		var trips = d3.selectAll(".trip");

		trips.attr("transform",function(){
			var shift = map(parseTime(interval.start));
			var t = (map(value)-shift)/(map(parseTime(interval.stop)) - shift);   //calc % point in time interval

			var p = path1.getPointAtLength(t*l);             //find that % point along the curve
			return "translate(" + p.x+"," + p.y+")";
		});
	}
}

function getInitialTrips(Intervals){
	var tripArray; 
}

function setTrip(tripData,Element,froute,trip_id){
	// console.log(tripData);
	TheRoute = froute;
	getJunctions = findJunctions(TheRoute);
	var TestTrip = tripData[trip_id];
	var trip;
	console.log(TestTrip);
	start = TestTrip[0].arrival_time;
	end = TestTrip[TestTrip.length-1].arrival_time;
	var intervals = getIntervals(TestTrip,TheRoute,"route_A");
	console.log(intervals);
	getTrip(trip_id,TestTrip[0].stop_id,froute,intervals);
	buildSlider(Element,start,end,intervals);

}

function findStop(stopPrefix){
	for(var i =0; i< Stops.length; i++){
		if(Stops[i].properties.stop_id.substring(0,3) === stopPrefix)
			return i;
	}
	return -1;
}

function getAllRouteIntervals(TripData,RouteData,route_id){
	var idArray = Object.keys(TripData);
	var tripIntervals = {};
	idArray.forEach(function(id){
		tripIntervals[id] = getIntervals(TripData[id],RouteData,route_id);
	})
	return tripIntervals;

}

var TimeObj = function(){
		this.start_id='';
		this.stop_id = '';
		this.start='';
		this.stop = '';
		this.lineID = '';
	}

function getIntervals(oneTripsData,RouteData,route_id){
	
	var intervals = [];
	for(var i =0; i< oneTripsData.length-1; i++){
		var timeObj = new TimeObj;
		timeObj.start_id = oneTripsData[i].stop_id.substring(0,3);
		timeObj.start = oneTripsData[i].departure_time;
		timeObj.stop = oneTripsData[i+1].arrival_time;
		timeObj.stop_id = oneTripsData[i+1].stop_id.substring(0,3);
		timeObj.lineID = route_id+"_s_" + timeObj.start_id +"_e_"+timeObj.stop_id;

		var stop1 = Stops[findStop(timeObj.start_id)].geometry.coordinates;
		var stop2 = Stops[findStop(timeObj.stop_id)].geometry.coordinates;

		if(inSameSegment(stop1,stop2)){
			intervals.push(timeObj);
		}
		else{
		
			var timeArr = []; //prepare an array of time objects;
			var realRoute = dfs(graph,timeObj.start_id,timeObj.stop_id);

			for(var j =0; j< realRoute.length-1; j++){
				var timeObja = new TimeObj();
				timeObja.start_id = realRoute[j];
				timeObja.stop_id = realRoute[j+1];
				timeObja.lineID = route_id+"_s_" + timeObja.start_id + "_e_" + timeObja.stop_id;
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
		}
	}

	return intervals;
}



//Best option might be to have a graph datastructure and then a method that 
//will convert the datastructure to a FeatureColllection after initial processing.