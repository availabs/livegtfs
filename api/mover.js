var segmentTree = require('./segment-tree-browser');
var mover = (function(){
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
		  // if (t != null && t.getHours() < 5) t.setDate(t.getDate() + 1);
		  return t;
	}		

		var slider = function(){
			var HOST = "http://localhost:1337"


			function getMaxOfArray(numArray){
				return Math.max.apply(null,numArray);
			}

			var buildSlider = function buildSlider(Element,start,end){

				var formatTime = d3.time.format("%X");
				var isClock = false;
				var margin = {top: 50, right: 200, bottom: 50, left: 200},
				    width = 120 - margin.left - margin.right,
				    height = 750- margin.bottom - margin.top;
				var buffer = 20;

				var y = d3.time.scale()
				    .domain([parseTime(start), parseTime(end)])
				    .range([0, height])
				    .clamp(true);

				var brush = d3.svg.brush()
				    .y(y)
				    .extent([parseTime(start),parseTime(end)])
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
				    .attr("transform", "translate(0,"+0+")")
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

				  handle.attr("cy", y(value));
				  setTime(value);
				  moveTrip(value,y);
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
				
			}
			return {buildSlider:buildSlider}
		}

		function moveTrip(value,map){
			var intervalList = {},rangeList = [],keeper = getKeeper();
			var v = timeToInt(d3.time.format('%X')(value));
			var segTree = getIntTree(), rangeTree = getRangeTree();
			segTree.queryPoint(v,function(results){
				results.forEach(function(result){
					var id = result.inter.name;
					intervalList[id] = result.inter.interval;
				})
			})
			rangeTree.queryPoint(v,function(results){
				results.forEach(function(result){
					var trip_id = result.inter;
					if(!intervalList[trip_id])
						rangeList.push(trip_id);
				});
			});
			if(intervalList){
				var activeTrips = Object.keys(intervalList);
				activeTrips = activeTrips.concat(rangeList);
				keeper.filter(activeTrips);
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
								return 'translate(50,50)';
							reverse = true;
						}
						var length = path1.getTotalLength();   //get length of the curve
						var shift = parseTime(interval.start).getTime();
						var	time = (value.getTime()-shift)/(parseTime(interval.stop).getTime() - shift);   //calc % point in time interval
						
						if(!isFinite(time*length)){
							return "translate(50,50)";
						}
						var p;
						if(reverse)
							p = path1.getPointAtLength(length-time*length);
						else
							p = path1.getPointAtLength(time*length);             //find that % point along the curve
						var temp = "translate(" + p.x+"," + p.y+")"; 
						keeper.add(d,temp);
						return temp;
					}
					else{
						return keeper.query(d);
					}

						
						

				});
			}
			function correctID(d){
				return d.replace(/\./g,'_');
			}
		}

		var getKeeper = (function(){
			var keepMap = {};
			return function(){
				return {
					add:function(key,value){
						keepMap[key] = value; 
					},
					clear:function(){
						keepMap = {}
					},
					query:function(key){
						return keepMap[key];
					},
					filter:function(keyList){
						newMap = {};
						keyList.forEach(function(k){
							if(keepMap[k])
								newMap[k] = keepMap[k];
						})
						keepMap = newMap;
					}

				}
			}
		})();

		function getInitialTrips(Intervals){
			var tripArray; 
		}
		var getIntTree = (function(){
			var segTree = segmentTree();
			return function(){return segTree};	
		} )();
		var getRangeTree = (function(){
			var rangeTree = segmentTree();
			return function() {return rangeTree};
		})();



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
		var tripSetter =(function(){ 
			var built = false;
			var isBuilt = function(){return built};
			var setBuilt = function(){built = true};
			
			return {
				setTrip:function(Element,data,times,id,filter){
					var segTree = getIntTree();
					var rangeTree = getRangeTree();
					if(id){
						parseRouteData(data.intervalObj['route_'+id],segTree,rangeTree,filter);
					}else{
					 	parseRouteData(data,segTree,rangeTree,filter);	
					}
					segTree.buildTree();
					rangeTree.buildTree();
					var s = slider(); 
					if(!isBuilt()){
						if(times)
							s.buildSlider(Element,times.start,times.end);
						else
							s.buildSlider(Element,'09:00:00','17:30:00');
						setBuilt();
					}
				},
				setNewTrip:function(Element,data,times,id,filter){
					var segTree = getIntTree();
					var rangeTree = getRangeTree();
					if(id){
						parseRoutes(data.intervalObj['route_'+id],segTree,rangeTree,filter);
					}else{
					 	parseRoutes(data,segTree,rangeTree,filter);	
					}
					segTree.buildTree();
					rangeTree.buildTree();
					var s = slider(); 
					if(!isBuilt()){
						if(times)
							s.buildSlider(Element,times.start,times.end);
						else
							s.buildSlider(Element,'09:00:00','17:30:00');
						setBuilt();
					}
				},
				
			}
		})();

		function parseRoutes(data,segTree,rangeTree,filter){
			if(typeof data.intervalObj !== 'undefined'){
				data = data.intervalObj;
				var routes = Object.keys(data);
					routes.forEach(function(route){
						parseTrips(data[route],segTree,rangeTree,filter);
					})
			}else{
				parseTrips(data,segTree,rangeTree,filter);
			}

		}

		function parseTrips(trips,segTree,rangeTree,filter){
			Object.keys(trips).forEach(function(trip){
				trips[trip].forEach(function(interval){
					var start = timeToInt(interval.start);
					var end = timeToInt(interval.stop);
					var intervalObj;
					if(start < end){
						intervalObj = {name:trip,interval:interval}
						segTree.pushInterval(start,end,intervalObj);
					}
				})
				var begin = timeToInt(trips[trip][0].start);
				var end = timeToInt(trips[trip][trips[trip].length-1].stop);
				if(begin < end){
					rangeTree.pushInterval(begin,end,trip);
				}
			})
		}

		function parseRouteData(data,segTree,rangeTree,filter){
			if(typeof data.intervalObj !== 'undefined'){
				data = data.intervalObj;
				var routes = Object.keys(data);
					routes.forEach(function(route){
						parseTripData(data[route].trips,segTree,rangeTree,filter);
					})
			}else{
				parseTripData(data.trips,segTree,rangeTree,filter);
			}

		}
		function parseTripData(trips,segTree,rangeTree,filter){
			var keys = Object.keys(trips);
			keys.forEach(function(trip){
					if(!filter || filter.indexOf(trip) >= 0){
						trips[trip].intervals.forEach(function(interval){
							var start = timeToInt(interval.start);
							var end = timeToInt(interval.stop);
							if(start<end){
								intervalObj = {name:trip,interval:interval};
								segTree.pushInterval(start,end,intervalObj);
							}
						})
						var begin = timeToInt(trips[trip].range.begin);
						var end = timeToInt(trips[trip].range.end);
						if(begin < end){
							rangeTree.pushInterval(begin,end,trip);
						}
					}
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

		return {tripSetter:tripSetter}
})();
if(typeof module !== 'undefined')
	module.exports = mover;