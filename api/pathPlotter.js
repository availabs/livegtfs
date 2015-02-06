var pathPlotter = (function(){

	var plotNewRoute = function plotNewRoute(featureCollection,path){
		var plot = d3.select("#plot");
		var  route = featureCollection.features[0].properties.route_id;
		var paths = plot.selectAll("#plot path#route_"+route);
		paths.data(featureCollection.features)
				.enter().append("path")
				.attr("class",function(d){return "route_"+d.properties.route_id;})
				.attr("id",function(d,i){ 
				
					str = "_s_"
					+nparse(d.start.properties.stop_ids[0])+"_e_"+nparse(d.end.properties.stop_ids[0]);
				return str;
				
				})


				.style("stroke",function(d){var color = d.properties.route_color; if(color){return '#'+color;} return '#000' })
				.style('fill','none')
				.style('stroke-width','1pt')
				.attr("d",path); 			
	}

	var plotter = function plotter(routes,id,pathcoll,settings){
		var	newroute = pather.getStops(id, routes, pathcoll);
		var routeSegments = pather.getRouteSegs(newroute).routeSegments;
		if(routeSegments.features.length >0){
			if(typeof settings.path !== 'undefined'){
				plotNewRoute(routeSegments,settings.path);
			}else{
				plotObj = plotCalcs(settings.data,settings.plotId,settings.scaleFactor);
				plotNewRoute(routeSegments,plotObj.path);

			}
		}
		return routeSegments;
	}

	var plotPathedRoutes = function plotPathedRoutes(routes,stops,settings,routeId){
		var pathcoll = pather.getPathCollection(routes,stops);
		if(typeof settings === 'undefined' ||  (typeof settings.path === 'undefined' && typeof settings.data.transform === 'undefined') ){
			throw {
					name:'UsageError',
					message: 'need existing plot settings or data defined transform and bounding box'
				};
		}
		if(!settings.path){
			settings.path = plotCalcs(settings.data,settings.plotId,settings.scaleFactor).path;
		}
		routes.forEach(function(route){
			if(route.geometry.coordinates.length > 0){
				if(routeId){
					if(routeId === route.properties.route_id){
						plotter(routes,route.properties.route_id,pathcoll,settings);	
					}
				}else{
					plotter(routes,route.properties.route_id,pathcoll,settings);
				}
			}
		})
	};
	var plotCalcs = function(Data,plotId,scaleFactor){
		var W_height=window.outerHeight,
		W_width=window.outerWidth;
		var group = d3.select('#'+plotId);
		var exists = group.node() !== null;
		
		var bbox = Data.bbox;
		var scale = .95/ Math.max( (bbox[3] - bbox[1])/W_width, (bbox[2] - bbox[0])/W_height  );
		
		var projection = d3.geo.mercator()
	            .center(Data.transform.translate)
	            .scale(scaleFactor*scale)
	            
	    var path = d3.geo.path().projection(projection);
		if(!exists){
			var Element = d3.select('body').append('div');
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

	
	return {plotPaths:plotPathedRoutes};

})()