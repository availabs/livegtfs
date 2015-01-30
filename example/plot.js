// /*This  file will contain the main plotting logic for the transit maps */



var plotMod = function(Element){
	var gtfs = gtfsDataMod();

	var HOST = "http://localhost:1337"
	var W_height=window.outerHeight,
		W_width=window.outerWidth;

	var projection, path,
	geoJson, GeoData,Stops=[],Routes,pathcoll;

	var plotCalcs = function(Data,plotId,scaleFactor){
		var group = d3.select(plotId);
		var exists = group.node() !== null;
		
		var bbox = Data.bbox;
		var scale = .95/ Math.max( (bbox[3] - bbox[1])/W_width, (bbox[2] - bbox[0])/W_height  );
		
		var projection = d3.geo.mercator()
	            .center(Data.transform.translate)
	            .scale(scaleFactor*scale)
	            
	    var path = d3.geo.path().projection(projection);
		if(!exists){
		    var x1,x2,y1,y2,bounds;
		    var bounds = path.bounds(Data);
		    /*Here we want to resize the image of the paths to fit the svg
		    /*get the bounds of the figure*/
		    x1 = bounds[0][0], x2 = bounds[1][0],y1 = bounds[0][1], y2 = bounds[1][1];
		    /*set the frame of the svg to fit the size of our figure*/
		    var height = y2-y1;
		    var width = x2-x1;
			var svg = Element.append("svg")
						.attr("height",height+0.1*height)
						.attr("width", width + 0.1*width)
						.style("float","left");
			group = svg.append("g").attr("id",plotId);
			group.attr("transform",function(){return "translate("+(0-x1+0.05*width)+","+(0-y1+0.05*height)+")";  });
		}
		return {group:group, path:path, projection:projection};
	}


	var plotRoutes = function plotRoutes(RouteData,plotId,scaleFactor,RouteId){
		var plotObj = plotCalcs(RouteData,plotId,scaleFactor);
		var path = plotObj.path;
		var projection = plotObj.projection;
		var group = plotObj.group;
		
		var paths = group.selectAll("path").data(RouteData.features)
					.enter().append("path").filter(function(d){
						if(RouteId){d.properties.route_id === RouteId} return true})
					.attr("id",function(d){return "route_"+d.properties.route_id;})
					.style("stroke",function(d){if(d.properties.route_color){return "#"+d.properties.route_color;}return '#000'})
					.style('fill','none')
					.style('stroke-width','1pt')
					paths.attr("d",path); 
		return plotObj;
	 
	}
	var getJuncs = function getJuncs(RouteData){
		return findJunctions(RouteData.features);
	}

	var mergeJuncs = function mergeStopsJuncs(stops,juncs){
		for (var i =0; i< juncs.length; i++){
			var junc = juncs[i].geometry.coordinates;
			var exists = false;
			stops.features.forEach(function(d,i){
				if (distance(d.goemetry.coordinates,junc) === 0){
					exists = true;
				} 
			})
			if (!exists){
				stops.features.push(juncs[i]);
			}
		}
	}

	var plotStops = function plotStops(StopData,plotObj,RouteID){
		var group = plotObj.group;
		var projection = plotObj.projection;
		var stops = topojson.feature(StopData,StopData.objects.stops);
		
		var tip = d3.tip()
					.attr("class",'station')
					.style({
							  'line-height': '1',
							  'font-weight': 'bold',
							  'padding': '12px',
							  'background': 'rgba(0, 0, 0, 0.8)',
							  'color': '#fff',
							  'border-radius': '2px'
							})
					.offset([-10,0])
					.html(function(d){
						return "<strong>Station: </strong><span style='color:red'>" +d.properties.stop_id+"</span>";
					})

		group.selectAll(".stationLabel")
						.data(stops.features).enter().append("circle").filter(function(d){if (RouteID){ return d.properties.stop_id.indexOf(RouteID)===0} return true})
						.attr("class",function(d){
							var everyStation = " stationLabel";
							var classes ="";
							for(i in d.properties.routes)
								classes += " route_"+d.properties.routes[i];
							classes += everyStation;
							return classes
						})
						.attr("id",function(d){return "station_"+d.properties.stop_id;})
						.attr("transform",function(d){
							return "translate("+projection(d.geometry.coordinates)+")"
						})
						.attr("r",function(d){
							if(d.properties.stop_id.indexOf('j') <0)
								return 3;
							else 
								return 0;
						})
						.style("fill","white")
						.style("stroke","black");

		group.call(tip);

			d3.selectAll(".stationLabel")
						.on("mouseover",tip.show)
						.on("mouseout",tip.hide)

		return stops.features;					
	}

	return {plotRoutes:plotRoutes,plotStops:plotStops};

	/*{type:'Feature',properties:{}, geometry:test}*/
	// function setup(GeoData,plotId,scaleFactor){
		
	// 	plotCalcs(Data,plotId,scaleFactor);

	// 	eqpts.forEach(function(d){
	// 		Stops.push(d);
	// 	});
		
		
	// 	return geoJson.features;
	// }




	function getTripData(Route_ID,Day,AgencyID,Element){
		var tripURL = /*'temp.json'//*/HOST+"/agency/"+AgencyID+"/day/"+Day+"/routeData?routeId=A";
		d3.json(tripURL,function(err,data){
			if(err) console.log(err);
			var intervals = data;
			tripSetter.setTrip(Route_ID,'tripData',Element,'froute',intervals);
		})
	}

	function findJunctions(feats){
		var eqpts = [];
		feats.forEach(function(d){
			var matrix = d.geometry.coordinates; 					//we have a multiline string so we start with a matrix of points
			for(var i = 0; i < matrix.length; i++){  		//loop through each linestring
				for(var j = i+1; j< matrix.length; j++){	//compare it with all linestrings ahead of it
					for(var irunner=0; irunner < matrix[i].length; irunner++){ //compare each point in i's linestring
						for(var jrunner=0; jrunner< matrix[j].length; jrunner++){ //to each point of j's linestring
							var a = matrix[i][irunner];
							var b = matrix[j][jrunner];
							if( distance(a,b) === 0){
								var index = -1;
								eqpts.forEach(function(junc,i){
									if(distance(junc.geometry.coordinates,a) === 0){
										index = i;
									}
								})
								if(index >= 0){
									eqpts[index].properties.routes.push(d.properties.route_id); 
								}else{
									var k =eqpts.length;
									var f = {type:"Feature",geometry:{type:'Point',coordinates:a},properties:{station_name:'j'+k,stop_id:'j'+k,stop_name:'junction'+k,routes:[d.properties.route_id]}};
									eqpts.push(f);	
								}
								
							}
						}
					}
				}
			}	
		})

		
		return eqpts;
	}

	function distance(a,b){
		return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) );
	}

	function plotAllRoutes(routes){
		routes.forEach(function(route){
			if(route.geometry.coordinates.length > 0)
				plotter(route.properties.route_id);
		})
	}

	function plotter(id){
		var	newroute = getStops(id, Routes, pathcoll);
		var finalRoute = setShapes(newroute);
		return finalRoute;
	}

}

