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

	keys.forEach(function(id){
		if(parseTime(tripIntervalRanges[id].begin) <= value && value <= parseTime(tripIntervalRanges[id].end)){
			var r_id = "route_" + id.substring(id.lastIndexOf('_')+1,id.indexOf('.'));
			currentTrips[r_id] = currentTrips[r_id] || []
			currentTrips[r_id].push(id);
		}
	})

	var currentKeys = Object.keys(currentTrips);

	currentKeys.forEach(function(route){
		currentTrips[route].forEach(function(trip){
			for(var i =0; i< intervals[route][trip].length; i++){
				if(parseTime(intervals[route][trip][i].start) <= value && value <= parseTime(intervals[route][trip][i].stop) )
					intervalList[trip] = intervals[route][trip][i];
			}	
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

var tripSetter = {
	required:0,
	count:0,
	setRequired:function(numRequired){
		this.required = numRequired;
	},
	setTrip:function(route_id,tripData,Element,froute,trip_id,trip_id2){
		// console.log(tripData);
		var TheRoute = froute;
		var TestTrip = tripData[trip_id]
		var TestTrip2= tripData[trip_id2];
		
		
		start = TestTrip[0].arrival_time;
		end = TestTrip2[TestTrip2.length-1].arrival_time;
		//var intervals = getAllRouteIntervals(tripData,TheRoute,"route_" + route_id);
		intervalStructure.addIntervals(tripData,TheRoute,"route_" + route_id);
		tripRanges.addRanges(getTripRanges(tripData));
		console.log(tripRanges);
		this.incCount();
		if(this.canBuild())
			buildSlider(Element,/*start*/"06:20:00","07:00:00"/*end*//*,intervals()*/);
	},
	incCount:function(){
		this.count++;
	},
	canBuild:function(){
		return this.count == this.required;
	}


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


function getAllRouteIntervals(tripData,RouteData,route_id){
	var keys = Object.keys(tripData);
	var tripIntervals = {};
	keys.forEach(function(id){
		tripIntervals[id] = getIntervals(tripData[id],RouteData,route_id)();
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

var intervalStructure = {
	intervalObj:{},
	addIntervals:function (tripData,RouteData,route_id){
		this.intervalObj[route_id] = getAllRouteIntervals(tripData,RouteData,route_id)();
	},

	getIntervals:function(){
		return this.intervalObj;
	}
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
	}

//Best option might be to have a graph datastructure and then a method that 
//will convert the datastructure to a FeatureColllection after initial processing.