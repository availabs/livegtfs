var gtfsDataMod = (function(){
		function reqUndef(varb,name){
			if(udef(varb)){
				console.log(name+' is required');
				return true;
			}
			return false;
		}
		function isFunc(foo){
			if(typeof foo === 'function')
				return true;
			return false;
		}
		function haveReqFunc(foo){
			if(!isFunc(foo)){
				console.log('must include callback');
				return false;
			}
			return true;

		}
		function udef(varb){
			if(typeof varb === 'undefined')
				return true;
			return false;
		}
		function callback(cb,args){
			try{
				cb(args);	
			}catch(e){
				console.error(e.name+':',e.message);
			}
		}

		var test = false;
		var HOST = "http://localhost:1337"
			var getRoutesData = function getRoutesData(AgencyID,cb){
				//We use the availabs api to retrieve route data of specified id
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(haveReqFunc(cb))
					var routeUrl = HOST+"/agency/"+AgencyID+"/routes";
				else
					return
				if(test){
					routeUrl = 'sampleRoutes.json';
				}
				currentAgency = AgencyID;
				d3.json(routeUrl,function(err,data){
					if(err) console.log(err);
					routeGeo = data;
					callback(cb,data);
				});
			};

			var getSegmentData = function getSegmentData(AgencyID,cb){
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(haveReqFunc(cb))
					var segUrl = HOST+'/agency/'+AgencyID+'/segmentData';
				else
					return
				currentAgency = AgencyID;
				d3.json(segUrl,function(err,data){
					if(err) console.log(err);
					callback(cb,data);
				})
			};

			var getStopsData = function getStopsData(AgencyID,opts){
				if(reqUndef(AgencyID,'AgencyID'))
					return;		
				var stopUrl = HOST+"/agency/"+AgencyID+"/stops";
				if(opts){
					if(test){
						stopUrl = 'sampleStops.json';
					}else{
						stopUrl +='?'
						var route_id = (typeof opts.routearg === 'string')? routearg: undefined;
						if(!udef(route_id)){
							stopUrl += '&routeId='+ route_id;
						}
						if(opts.format){
							stopUrl += '&format=' + opts.format
						}
					}
					
				}
				var cb = arguments[arguments.length-1];     //callback will always be the last one
				if(!haveReqFunc(cb))
					return;

				d3.json(stopUrl,function(err,data){			//use d3 to fetch data
					if(err) console.log(err);
					if(opts.Type && opts.Type === 'FeatureCollection'){
						var stops = topojson.feature(data,data.objects.stops);
						stops.bbox = data.bbox; stops.transform = data.transform;
						callback(cb,stops);
					}else{
						callback(cb,data);	
					}
					
				});	
			}

			var getTripsData = function getTripsData(AgencyID,Day,Route_ID,cb){
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(reqUndef(Day,'Day'))
					return;
				if(reqUndef(Route_ID,'Route_ID'))
					return;

				var cb = arguments[arguments.length-1];
				if(!haveReqFunc(cb))
					return;
				var tripURL = HOST+'/agency/'+AgencyID+'/routes/'+Route_ID+'/schedule?day='+Day;

				d3.json(tripURL,function(err,data){
					if(err) console.log(err);		
					tdata = {}
					data.forEach(function(el){
						if(!tdata[el.trip_id])
							tdata[el.trip_id] = []
						tdata[el.trip_id].push(el)
					})
					console.log(data)
					var keys = Object.keys(tdata)
					keys.forEach(function(key){
						var list = tdata[key],p1,p2;
						var objList = [];
						for(var i=0; i<list.length-1; i++){
							p1 = list[i]; p2 = list[i+1];
							objList.push({
								start_id:p1.stop_id,
								stop_id: p2.stop_id,
								start:   p1.departure_time,
								stop:    p2.arrival_time,
								direction: p2.direction_id
							})
						}
						tdata[key] = objList;

					})
					callback(cb,tdata);
				})
			};

		var movementTest = false;
			var getRouteTripsData = function getRouteTripsData(AgencyID, Day){
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(reqUndef(Day,'Day'))
					return;

				var cb = arguments[arguments.length-1];
				if(!haveReqFunc(cb))
					return;
				var route_id = arguments[2];
				var tripURL = HOST+"/agency/"+AgencyID+"/day/"+Day+"/routeData";
				if(!udef(route_id) && route_id !== cb)
					tripURL += '?routeId='+route_id;

				if(movementTest){
					tripURL = 'MONDAY.json';
				}
				d3.json(tripURL,function(err,data){
					if(err) console.log(err);
					callback(cb,data);
				})
			};


			var Route = function(id){
				this.id = id;
				this.trips = [];
				this.addTrip = function(trip){
					this.trips.push(trip);
				}
			}
			var Trip = function(id,route_id){
				this.id = id;
				this.route_id = route_id;
				this.direction_id = 0;
				this.intervals = [];
				this.addInterval = function(interval){
					this.intervals.push(interval);
				}
			}
			var getSimpleSched = function(AgencyID,opt,cb){
				if(reqUndef(AgencyID,'AgencyID'))
					return console.log("undefined ID");
				if(reqUndef(opt.Day,'Day'))
					return console.log("undefined day");

				if(!haveReqFunc(cb))
					return console.log('bad function')
				var url = HOST+'/agency/'+AgencyID+'/'+opt.Day+'/schedule';
				d3.json(url,function(err,data){
					if(err) console.log(err);
					var Routes = {};
					var trips = {};
					data.forEach(function(trip){
						var id = JSON.stringify(trip.stops);
						trips[id] = trips[id] || new Trip(id,trip.route_id);
						trips[id].addInterval([trip.starting,trip.ending]);
						if(trips[id].direction_id && trips[id].direction_id !== trip.direction_id)
							console.log('!!!SHIFT!!!');
						trips[id].direction_id = trip.direction_id;
					})

					Object.keys(trips).forEach(function(trip_id){
						var trip = trips[trip_id];
						var rid = trip.route_id;
						Routes[rid] = Routes[rid] || new Route(rid);
						Routes[rid].addTrip(trip);
					})
					
					if(typeof opt.route_id !== 'undefined')
						callback(cb,Routes[opt.route_id]);
					else
						callback(cb,Routes);
				})
			}

			var editStops = function(newStops){
				var url = HOST+'/data/upload/stops';
				var data ={data:newStops};
				d3.json(url)
				.header('Content-Type', 'application/json')
				.post(JSON.stringify(data),function(err,data){
					console.log(data);
				});	
			}
			var editRoute = function(newRoute){
				var url = HOST+'/data/upload/route';
				var data = {data:newRoute}
				d3.json(url)
				.header('Content-Type', 'application/json')
				.post(JSON.stringify(data),function(err,data){
					console.log(data);
				});	
			}

			return {
				'getRoutes': getRoutesData,
				'getStops' : getStopsData,
				'getTrips' : getTripsData,
				'getRouteTrips' : getRouteTripsData,
				'getSegmentData':getSegmentData,
				'getSchedule':getSimpleSched,
				'editStops': editStops,
				'editRoute': editRoute,

			}

	})();

	if(module && module.exports){
		module.exports = gtfsDataMod;
	}