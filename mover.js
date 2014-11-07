//plotter


function getTrip(member,StartID,froute){
	var tripObj = {previousLine:'',currentLine:'',nextLine:'', name:member};
	var startStation = d3.select("#plot");
	startStation.append("circle")
	.attr("class","trip")
	.attr("id",member)
	.attr("r","4")
	.attr("transform",d3.select("#station_"+StartID).attr("transform"));
	updateTripObj(tripObj,StartID,froute);
	console.log(tripObj);
	return tripObj; 
}

function updateTripObj(tripObj,curStartID,froute){
	routeMapping(tripObj,curStartID,froute);
}

function routeMapping(tripObj,stopId,froute){
	var prev,curr,next,nextEnd;
	var lines = froute.features;
	var len = lines.length;
	for(var i =0; i<len; i++){
		prev = curr;//set previous stop to what the old current stop was
		curr = lines[i].start.properties.stop_ids[0].substring(0,3); //set current to our current starting point
		next = lines[i].end.properties.stop_ids[0].substring(0,3);   //set next to the end of our current lineString
		if(i<len-1)
			nextEnd = lines[i+1].end.properties.stop_ids[0].substring(0,3);
		if(curr === stopId.substring(0,3))
			break;
	}
	if(prev)
		tripObj.previousLine = "#route_A_s_"+prev+"_e_"+curr;
	tripObj.currentLine = "#route_A_s_"+curr+"_e_"+next;
	tripObj.nextLine = "#route_A_s_"+next+"_e_"+nextEnd;

	
}

function moveTrip(value,map,trip){
	var hours,minutes;
	if (value instanceof Date){
		hours = value.getHours();
		minutes = value.getMinutes();
	}

	var path1 = d3.select(trip.currentLine).node();
	var l = path1.getTotalLength();
	var trips = d3.selectAll(".trip");
	trips.attr("transform",function(){
		var t = map(value)/getMaxOfArray(map.range());
		var p = path1.getPointAtLength(t*l);
		var d = distance([p.x,p.y], projection(Stops[findStop("A03")].geometry.coordinates) );
		console.log(d);
		if(d < 0.0001)
			console.log("On Stop")
		return "translate(" + p.x+"," + p.y+")";
	});
}

function setTrips(tripData,Element,froute){
	// console.log(tripData);
	console.log("The Route",froute);
	var TestTrip = tripData["B20140608WKD_001150_A..S74R"];
	var trip;
	start = TestTrip[0].arrival_time;
	end = TestTrip[TestTrip.length-1].arrival_time;
	trip = getTrip("B20140608WKD_001150_A..S74R",TestTrip[0].stop_id,froute);
	buildSlider(Element,start,end,trip);
}


function findStop(stopPrefix){
	for(var i =0; i< Stops.length; i++){
		if(Stops[i].properties.stop_id.substring(0,3) === stopPrefix)
			return i;
	}
	return -1;
}

function timeChunker(tripData,timespan){
	var timeChunks = [];
	for(var i = 0; i< tripData.length; i++){
		var timechunk = [];
		for(var j=0; j < timespan.length; j++){
			if( timespan[j] >=tripData[i] && timespan[j]< tripData[i+1])
				timechunk.push(time)
		}
		timeChunks.push(timechunk);
	}
}