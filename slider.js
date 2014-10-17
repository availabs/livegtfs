/*This file will contain the main display and movement
	logic for the time slider*/


var HOST = "http://localhost:1337"
tripData = {}

function getTripData(Route_ID,Day,AgencyID){
	var tripURL = HOST+"/agency/routeSchedule?id="+AgencyID+"&day="+Day+"&route_id="+Route_ID;
	d3.json(tripURL,function(err,data){
		if(err) console.log(err);
		var beenPlotted = false;
			data.forEach(function(d){
				if(!tripData[d.trip_id])
					tripData[d.trip_id] = []
				tripData[d.trip_id].push(d);
				if( (d.trip_id == "R20130803WKD_000100_SI.S01R") && !beenPlotted  ){
					getTrip(tripData,"R20130803WKD_000100_SI.S01R");
					beenPlotted = true;
				}
			})
		console.log(tripData);
	})
}

function getTrip(Data,member){
	var startStation = d3.select("#plot");
	startStation.append("circle")
	.attr("class","trip")
	.attr("id",member)
	.attr("r","4")
	.attr("transform",d3.select("#S31S").attr("transform"));
	
}


function getMaxOfArray(numArray){
	return Math.max.apply(null,numArray);
}

function buildSlider(Element){




	var formatTime = d3.time.format("%I:%M%p");
	var isClock = false;
	var margin = {top: 50, right: 200, bottom: 50, left: 200},
	    width = 120 - margin.left - margin.right,
	    height = 750- margin.bottom - margin.top;
	var buffer = 20;

	var y = d3.time.scale()
	    .domain([parseTime("5:30AM"), parseTime("11:30PM")])
	    .range([0, height])
	    .clamp(true);

	var brush = d3.svg.brush()
	    .y(y)
	    .extent([parseTime("5:30AM"),parseTime("5:30AM")])
	    .on("brush", brushed);
	var div = Element.append("div");
		div.attr("id","sliderDiv")
			.style("float","left");
	var svg = div.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g")
	   	.attr("transform", "translate(" +buffer+ "," + 0 + ")")
	
	    
	svg.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate(0,"+margin.top+")")
	    .call(d3.svg.axis()
	      .scale(y)
	      .orient("right")   //this says align axis vertically with labels on right
	      .ticks(32)
	      .tickSize(0)
	      .tickFormat(formatTime)
	      .tickPadding(12))
	  .select(".domain")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "halo");

	var slider = svg.append("g")
	    .attr("class", "slider")
	    .attr("transform", "translate(0,"+margin.top+")")
	    .call(brush);

	slider.selectAll(".extent,.resize")
	    .remove();

	slider.select(".background")
		.attr("width","50");
	    
	var handle = slider.append("circle")
	    .attr("class", "handle")
	    .attr("transform", "translate(0,"+margin.top+")")
	    .attr("r", 9);

	  //  slider
	  //   .call(brush.event)
	  // .transition() // gratuitous intro!
	  //   .duration(750)
	  //   .call(brush.extent([parseTime("5:30AM"),parseTime("5:30AM")]))
	  //   .call(brush.event);

	



	function brushed() {
	  var value = brush.extent()[0];
	  if (d3.event.sourceEvent) { // not a programmatic event
	  	mouse = d3.mouse(this)[1];
	    value = y.invert(d3.mouse(this)[1]);
	    brush.extent([value, value]);
	  }

	  handle.attr("cy", y(value)-margin.top);
	  setTime(value);
	  moveTrip(value);
	}

	function parseTime(s) {
	  var t = formatTime.parse(s);
	  if (t != null && t.getHours() < 3) t.setDate(t.getDate() + 1);
	  return t;
	}


	function setTime(time){
		if( !isClock){
			var div = d3.select("body").append("div");
				div.append("h3").attr("id","clock");
				div.style("float","left");
			isClock = true;
		}
		var clock = d3.select("#clock");

		if (time instanceof Date){
			time = formatTime(time)	
		}
		clock.text( "Current Time: "+time )
	}

	function moveTrip(value){
		var hours,minutes;
		if (value instanceof Date){
			hours = value.getHours();
			minutes = value.getMinutes();
		}
		var path = d3.select('#SI').node();
		var l = path.getTotalLength();

		var trips = d3.selectAll(".trip");
		trips.attr("transform",function(){
			var t = y(value)/getMaxOfArray(y.range())
			var p = path.getPointAtLength(t*l);
			console.log(t,l)
			return "translate(" + p.x+"," + p.y+")";
		});
	}

	getTripData("SI","MONDAY",109)
}
