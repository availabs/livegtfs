var distance = function(a,b){
				return Math.sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) )
			};

var fuzzyfixer = function(rdata,sdata){
				//create a new stop data structure
				newStops = {type:sdata.type,features:[],bbox:sdata.bbox,transform:sdata.transform};

				sdata.features.forEach(function(stopobj){ //for each existing stop
							var routeList = []; 
							//and for every route its associated with
							stopobj.properties.routes.forEach(function(routeid){  
								rdata.features.forEach(function(route){         //search for the route
									if(route.properties.route_id === routeid)
										routeList.push(route);					//add it to the list
								});
							});
							

							
							var stopcoor = stopobj.geometry.coordinates;  //get currenct stop coordinates
							routeList.forEach(function(route,i){			//for each associated route
								var mindist = Infinity; 					//set smallest distance to INF
								var minpoint = [0,0,0];						//initialize closest coordinate
								if(route.geometry.coordinates.length >0){  //if route exists
									//instantiate a new stop that will be paired with this route
									newStop = {							
										geometry:{
												type:"Point",
												coordinates:stopobj.geometry.coordinates
												},
										properties:{
												routes:[route.properties.route_id],
												stop_code:stopobj.properties.stop_code,
												stop_id:stopobj.properties.stop_id,
												stop_name:stopobj.properties.stop_name
												},
										type:'Feature'
										}
									route.geometry.coordinates.forEach(function(line,j){
										line.forEach(function(point,k){
											var dist = distance(stopcoor,point);
											if(dist < mindist){
												minpoint = [j,k];
												mindist = dist;
											} 
										})
									})
									newStop.geometry.coordinates = route.geometry.coordinates[minpoint[0]][minpoint[1]];
									newStops.features.push(newStop);
								}
							})
						})
					return newStops;
			}

if(typeof module !== 'undefined' && typeof require !== 'undefined')
	module.exports = fuzzyfixer;