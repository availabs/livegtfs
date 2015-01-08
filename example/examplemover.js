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
	var intervalList = {};
	var v = timeToInt(d3.time.format('%X')(value));
	var segTree = getSegTree();
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
				var identifier = '.'+interval.lineClass+'#_s_'+interval.start_id+'_e_'+interval.stop_id
				var path1 = d3.select(identifier).node();
				var reverse = false;
				if(path1 === null)
				{
					identifier = '.'+interval.lineClass+'#_s_'+interval.stop_id+'_e_'+interval.start_id
					path1 = d3.select(identifier).node();
					if( path1 === null)
						return 'translate(0,0)';
					reverse = true;
				}

				var length = path1.getTotalLength();   //get length of the curve
				var shift = map(parseTime(interval.start));
				var	time = (map(value)-shift)/(map(parseTime(interval.stop)) - shift);   //calc % point in time interval
				
				if(!isFinite(time*length)){
					return "translate(0,0)";
				}
				var p;
				if(reverse)
					p = path1.getPointAtLength(length-time*length);
				else
					p = path1.getPointAtLength(time*length);             //find that % point along the curve
				
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
var getSegTree = (function(){
	var segTree = segmentTree();
	return function(){return segTree};	
} )();


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
	setTrip:function(route_id,tripData,Element,froute,data){
		var TheRoute = froute;
		var segTree = getSegTree();
		parseRouteData(data,segTree);
		segTree.buildTree();
		buildSlider(Element,/*start*/"06:20:00","10:30:00"/*end*//*,intervals()*/);
	},
	incCount:function(){
		this.count++;
	},
	canBuild:function(){
		return this.count == this.required;
	}
}

function parseRouteData(data,segTree){
	if(typeof data.intervalObj !== 'undefined'){
		data = data.intervalObj;
		var routes = Object.keys(data);
			routes.forEach(function(route){
				parseTripData(data[route].trips,segTree);
			})
	}else{
		parseTripData(data.trips,segTree);
	}

}
function parseTripData(trips,segTree){
	var keys = Object.keys(trips);
	keys.forEach(function(trip){
				trips[trip].intervals.forEach(function(interval){
					var start = timeToInt(interval.start);
					var end = timeToInt(interval.stop);
					if(start<end){
						intervalObj = {name:trip,interval:interval};
						segTree.pushInterval(start,end,intervalObj);
					}
				})

			})
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
