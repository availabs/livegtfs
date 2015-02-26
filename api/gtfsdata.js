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
					}
					var route_id = (typeof opts.routearg === 'string')? routearg: undefined;
					if(!udef(route_id)){
						stopUrl += '?'+ route_id;
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
					callback(cb,data);
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

			return {
				'getRoutes': getRoutesData,
				'getStops' : getStopsData,
				'getTrips' : getTripsData,
				'getRouteTrips' : getRouteTripsData,
				'getSegmentData':getSegmentData
			}

	})();
