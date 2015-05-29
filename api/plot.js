var display = function(point){
	group = d3.select('#plot')
	datum = {type:'Feature',geometry:{coordinates:point,type:'Point'},properties:{id:point.toString()}}
	group.selectAll(".test").data(datum)
	.append('circle')
	.attr('class','test')
	.attr("transform",function(d){
		return "translate("+projection(d.geometry.coordinates)+")"
	})
	.attr("r",function(d){
		if(d.properties.stop_id.indexOf('j') <0)
			return 3;
		else 
			return 0
	})
	.style("fill","white")
	.style("stroke","black");
}
var plotMod = function(Element){
	var Gpath,Gprojection;
	var HOST = "http://localhost:1337"
	var W_height=window.outerHeight,
		W_width=window.outerWidth;
	
	var plotCalcs = function(Data,plotId,scaleFactor,feature){
		var group = d3.select('#'+plotId);
		var exists = group.node() !== null;
		var bbox = Data.bbox;
		var scale = .95/ Math.max( (bbox[3] - bbox[1])/W_width, (bbox[2] - bbox[0])/W_height  );
		var projection 
		if(!Gprojection)
			Gprojection = d3.geo.mercator()
	            .center(Data.transform.translate)
	            .scale(scaleFactor*scale)
	    projection = Gprojection
	    var path 
	    if(!Gpath)
	    	Gpath = d3.geo.path().projection(projection);
	    path = Gpath;
		if(!exists){
		    var x1,x2,y1,y2,bounds;
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

	var plotShape = function(shapeList,plotId,shapeId,type){
		var obj = {
			type:'Feature',
			geometry:{coordinates:shapeList,type:type},
			properties:{route_id:shapeId,route_color:'#444'}
		};
		var paths = d3.select('#'+plotId)
		.append('path')
		.attr('id',shapeId)
		.style("stroke",'#444')
		.style('fill','none')
		.style('stroke-width','2pt')
		.attr("d",Gpath(obj));
	}

	var plotRoutes = function plotRoutes(RouteData,plotId,scaleFactor,RouteId){
		var id, plotObj;
		if(RouteId){
			RouteData.features.forEach(function(d,i){

				if(d.properties.route_id === RouteId)
					id = i;
			});
			plotObj = plotCalcs(RouteData,plotId,scaleFactor,RouteData.features[id]);
		}else{
			plotObj = plotCalcs(RouteData,plotId,scaleFactor);
		}
		
		var path = plotObj.path;
		var projection = plotObj.projection;
		var group = plotObj.group;
		
		var paths = group.selectAll("path").data(RouteData.features.filter(function(d){if(RouteId){return d.properties.route_id === RouteId} return true}))
					.enter().append("path")
					.attr("id",function(d){return "route_"+d.properties.route_id;})
					.style("stroke",function(d){if(d.properties.route_color){return "#"+d.properties.route_color;}return '#000'})
					.style('fill','none')
					.style('stroke-width','1pt')
					paths.attr("d",path); 
		return plotObj;
	 
	}

	



	var plotStops = function plotStops(StopData,plotId,scaleFactor,junctions,RouteID){
		// var stops = topojson.feature(StopData,StopData.objects.stops);
		// stops.bbox = StopData.bbox;
		// stops.transform = StopData.transform;
		var stops = StopData;
		if(junctions){
			for (var i =0; i< junctions.length; i++){
				var junc = junctions[i].geometry.coordinates;
				var exists = false;
				stops.features.forEach(function(d,i){
					if (distance(d.geometry.coordinates,junc) === 0){
						exists = true;
					} 
				})
				if (!exists){
					stops.features.push(junctions[i]);
				}
			}		
		}
		var subset;
		if(RouteID){
			subset={type:"Feature",geometry:{coordinates:[],type:'LineString'}};
			StopData.features.forEach(function(stop,i){
				if(stop.properties.routes.indexOf(RouteID) >=0)
					subset.geometry.coordinates.push(stop.geometry.coordinates);
			});
			
		}else{
			subset = undefined;
		}
		var plotObj = plotCalcs(stops,plotId,scaleFactor,subset);
		var group = plotObj.group;
		var projection = plotObj.projection;
		
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
						return "<strong>Station: </strong><span style='color:red'>" +d.properties.stop_id+d.properties.stop_name+"<br/>"+d.geometry.coordinates.toString()+"</span>";
					})

		group.selectAll(".stationLabel")
						.data(stops.features.filter(function(d){if (RouteID){ var match = false; d.properties.routes.forEach(function(d){ if(d === RouteID) match = true;}); return match} return true}))
						.enter().append("circle")
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
								return 0
						})
						.style("fill","white")
						.style("stroke","black");

		group.call(tip);

			d3.selectAll(".stationLabel")
						.on("mouseover",function(d){
							tip.show(d);
							console.log(d.geometry.coordinates);
						})
						.on("mouseout",tip.hide)
				
		return plotObj;
	};
	return {plotRoutes:plotRoutes,plotStops:plotStops,plotShape:plotShape};

	function getTripData(Route_ID,Day,AgencyID,Element){
		var tripURL = /*'temp.json'//*/HOST+"/agency/"+AgencyID+"/day/"+Day+"/routeData?routeId=A";
		d3.json(tripURL,function(err,data){
			if(err) console.log(err);
			var intervals = data;
			tripSetter.setTrip(Route_ID,'tripData',Element,'froute',intervals);
		})
	}



	function distance(a,b){
		return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) );
	}
};

if(typeof module !== 'undefined')
	module.exports = plotMod;