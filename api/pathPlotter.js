
var pathPlotter = (function(){

	var plotNewRoute = function plotNewRoute(route,path,plotId){
		var plot = d3.select("#"+plotId);
		var paths = plot.selectAll("#"+plotId+" path#route_"+route.properties.route_id);

		var features = [];
		var len = route.stations.length;
		for(var i = 0; i< len; i++){
			var	startStop = route.stations[i];
			var line = route.geometry.coordinates[i];
			features.push({type:'Feature',geometry:{coordinates:line,type:'LineString'},properties:{start:startStop[0],end:startStop[1]}});
		}

		paths.data(features)
				.enter().append("path")
				.attr("class",function(d){return "route_"+route.properties.route_id;})
				.attr("id",function(d,i){ 
					str = "_s_"
					+nparse(d.properties.start.properties.stop_ids[0])+"_e_"+nparse(d.properties.end.properties.stop_ids[0]);
				return str;
				
				})


				.style("stroke",function(d){var color = route.properties.route_color; if(color){return '#'+color;} return '#000' })
				.style('fill','none')
				.style('stroke-width','1pt')
				.on('mouseover',function(d){
					d3.select(this).style({'stroke-width':'16pt',opacity:'0.6'})
				})
				.on('mouseout',function(d){
					d3.select(this).style({'stroke-width':'1pt',opacity:'0.6'})
				})
				.attr("d",path); 			
	}

	var plotter = function plotter(id,generator,settings){
		var routeSegments = generator(id);
		if(routeSegments.geometry.coordinates.length >0){
			if(typeof settings.path !== 'undefined'){
				plotNewRoute(routeSegments,settings.path,settings.plotId);
			}else{
				plotObj = plotCalcs(settings.data,settings.plotId,settings.scaleFactor);
				plotNewRoute(routeSegments,plotObj.path,settings.plotId);

			}
		}
		return routeSegments;
	}

	var checkSettings = function(settings){
		if(typeof settings === 'undefined' ||  (typeof settings.path === 'undefined' && typeof settings.data.transform === 'undefined') ){
			throw {
					name:'UsageError',
					message: 'need existing plot settings or data defined transform and bounding box'
				};
		}
	}

	var plotSegments = function(segData,plotId,scaleFactor,RouteId){
		var path,plotObj;
		if(RouteId){
			segData.features.forEach(function(d,i){
				if(d.properties.route_id === RouteId){
					plotObj = plotCalcs(segData,plotId,scaleFactor,segData.features[i]);
					path = plotObj.path;
					plotNewRoute(d,path,plotId);
				}
			});
			
		}else{
			plotObj = plotCalcs(segData,plotId,scaleFactor);
		
			path = plotObj.path;
			segData.features.forEach(function(route){
				if(segData.features.length > 0 && !RouteId)
					plotNewRoute(route,path,plotId);
				else
					console.log('Empty Route')
			});
		}
	}

	var plotPathedRoutes = function plotPathedRoutes(routes,stops,settings,routeId){
		var generator = pather.nrGen(routes,stops);
		checkSettings(settings);
		if(!settings.path){
			settings.path = plotCalcs(settings.data,settings.plotId,settings.scaleFactor).path;
		}
		routes.forEach(function(route){
			if(route.geometry.coordinates.length > 0){
				if(routeId){
					if(routeId === route.properties.route_id){
						plotter(route.properties.route_id,generator,settings);	
					}
				}else{
					plotter(route.properties.route_id,generator,settings);
				}
			}
		})
	};
	var plotCalcs = function(Data,plotId,scaleFactor,feature){
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
		    var bounds;
		    if(feature){
		    	bounds = path.bounds(feature);
		    }else{
		    	bounds = path.bounds(Data);
		    }
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

	
	return {plotPaths:plotPathedRoutes,plotSegs:plotSegments};

})()

if(typeof module !== 'undefined')
	module.exports = pathPlotter;