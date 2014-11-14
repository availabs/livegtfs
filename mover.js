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

function findJunctions(RouteData){
	var Junctions = {
		type:'FeatureCollection',
		features:[]
	};
	RouteData.features.forEach(function(lineString){
		if(lineString.start.properties.stop_ids[0].indexOf("_")>0)
			Junctions.features.push(lineString);
	})
	console.log("Junctions",Junctions);
	return function(){
		return Junctions;
	}
}
function parseTime(s) {
   	  var formatTime = d3.time.format("%X");
	  var t = formatTime.parse(s);
	  if (t != null && t.getHours() < 5) t.setDate(t.getDate() + 1);
	  return t;
}

function moveTrip(value,map,trip,intervals){
	
	var interval;
	for(var i =0; i< intervals.length; i++){
		if(parseTime(intervals[i].start) <= value && value <= parseTime(intervals[i].stop) )
			interval = intervals[i];
	}
	
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

function setTrips(tripData,Element,froute){
	// console.log(tripData);
	TheRoute = froute;
	getJunctions = findJunctions(TheRoute);
	var TestTrip = tripData["B20140608WKD_001150_A..S74R"];
	var trip;
	console.log(TestTrip);
	start = TestTrip[0].arrival_time;
	end = TestTrip[TestTrip.length-1].arrival_time;
	var intervals = getIntervals(TestTrip,TheRoute);
	console.log(intervals);
	trip = getTrip("B20140608WKD_001150_A..S74R",TestTrip[0].stop_id,froute,intervals);
	buildSlider(Element,start,end,trip,intervals);

}

function findStop(stopPrefix){
	for(var i =0; i< Stops.length; i++){
		if(Stops[i].properties.stop_id.substring(0,3) === stopPrefix)
			return i;
	}
	return -1;
}

function getIntervals(oneTripsData,RouteData){
	var intervals = [];
	for(var i =0; i< oneTripsData.length-1; i++){
		var timeObj = {start_id:'',stop_id:'',start:'', stop:'',lineID:''};
		timeObj.start_id = oneTripsData[i].stop_id.substring(0,3);
		timeObj.start = oneTripsData[i].departure_time;
		timeObj.stop = oneTripsData[i+1].arrival_time;
		timeObj.stop_id = oneTripsData[i+1].stop_id.substring(0,3);
		timeObj.lineID = "route_A_s_" + timeObj.start_id +"_e_"+timeObj.stop_id;

		var stop1 = Stops[findStop(timeObj.start_id)].geometry.coordinates;
		var stop2 = Stops[findStop(timeObj.stop_id)].geometry.coordinates;

		if(inSameSegment(stop1,stop2)){
			intervals.push(timeObj);
		}
		else{
			var junction =  findEndJunction(timeObj.stop_id);
			//AUGMENT GRAPH//
			graph.bridgeVerticies(timeObj.start_id,junction.start.properties.stop_id,timeObj.stop_id);

			//END AUGMENT GRAPH//

			
			
			var timeObj1={};
			timeObj1.start_id = timeObj.start_id;
			timeObj1.start = timeObj.start;
			timeObj1.stop_id = junction.station_name;
			//divide the time into partitions of the lineString
			var path = d3.select("#"+timeObj.lineID).node();
			var date1 = parseTime(timeObj.start);
			var date2 = parseTime(timeObj.stop);
			var fraction = Math.ceil( (date1.getTime() + date2.getTime())/2);
			var form = d3.time.format("%X");
			var newTime = form(new Date(fraction));
			timeObj1.stop = newTime;
			timeObj1.lineID = "route_A_s_"+timeObj1.start_id+"_e_"+timeObj1.stop_id;
			var timeObj2 ={};
			timeObj.start_id = timeObj1.stop_id;
			timeObj2.start = newTime;
			timeObj2.stop_id = timeObj.stop_id;
			timeObj2.stop = timeObj.stop;
			timeObj2.lineID = "route_A_s_"+timeObj2.start_id+"_e_"+timeObj2.stop_id;
			
			intervals.push(timeObj1);
			intervals.push(timeObj2);
			//console.log(junction);
			
		}
	}
	return intervals;
}

function findEndJunction(endStop){
	//hack for bad assumption
	if(endStop === "H02")
		endStop = "H01"
	var junctions = getJunctions().features;
	var index=0;
	var len = junctions.length;
	for(var i =0; i< len; i++){
		if( junctions[i].start.properties.stop_id.indexOf(endStop) >=0 ){ 
			return junctions[i];
		}
	}
	return null;
}

//Best option might be to have a graph datastructure and then a method that 
//will convert the datastructure to a FeatureColllection after initial processing.