// /*This  file will contain the main plotting logic for the transit maps */
var HOST = "http://localhost:1337"
var W_height=window.outerHeight,
	W_width=window.outerWidth;

var currentAgency;
var projection, path,
geoJson, GeoData,Stops,Routes,pathcoll;

var Day = "MONDAY";

function getGraphData(Element,AgencyID){
	//We use the availabs api to retrieve route data of specified id
	var routeUrl = HOST+"/agency/"+AgencyID+"/routes";
	
	currentAgency = AgencyID;
	d3.json(routeUrl,function(err,data){
		if(err) console.log(err);
		routeGeo = data;
		Routes = plotGraph(Element,routeGeo);
		//console.log(Routes)
		//getStopData(Element,AgencyID);
	});
}

function getStopData(Element,AgencyID){
	var stopUrl = HOST+"/agency/"+AgencyID+"/stops";

	d3.json(stopUrl,function(err,data){
		if(err) console.log(err);
		stopGeo = data;
		Stops = plotStops(stopGeo);
		// pathcoll = getPathCollection(Routes,Stops);
		// //Routes.forEach(function(route){
		// 	getTripData("A",Day,AgencyID,Element);
		//})
		
	});	
}

function plotStops(StopData){

	var group = d3.select("#plot");
	var stops = topojson.feature(StopData,StopData.objects.stops);

	var tip = d3.tip()
				.attr("class",'station')
				.offset([-10,0])
				.html(function(d){
					return "<strong>Station: </strong><span style='color:red'>" +d.properties.stop_name+"</span>";
				})

	group.selectAll(".stationLabel")
					.data(stops.features).enter().append("circle")
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
					.attr("r","1")
					.style("fill","white")
					.style("stroke","black");

	group.call(tip);

		d3.selectAll(".stationLabel")
					.on("mouseover",tip.show)
					.on("mouseout",tip.hide)

	return stops.features;					
}

/*{type:'Feature',properties:{}, geometry:test}*/
function plotGraph(Element,GeoData){
	var bbox = GeoData.bbox;
	var scale = .95/ Math.max( (bbox[3] - bbox[1])/W_width, (bbox[2] - bbox[0])/W_height  );
	
	geoJson = GeoData;
	projection = d3.geo.mercator()
            .center(GeoData.transform.translate)
            .scale(50*scale)
            
    path = d3.geo.path().projection(projection);
    var x1,x2,y1,y2,bounds;
    bounds = path.bounds(geoJson);
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
	var group = svg.append("g").attr("id","plot");
				//translate our figure in the svg to upper left corner*/
				group.attr("transform",function(){return "translate("+(0-x1+0.05*width)+","+(0-y1+0.05*height)+")";  });

	var featArr = geoJson.features[10].geometry.coordinates;
	var coll = []
	var feats = {"type":"FeatureCollection","features":[]}
	var colors = ["567",'192','6f6','888'];
	featArr.forEach(function(d,i){
		var f = {type:"Feature",properties:{route_id:"A",route_color:colors[i]},geometry:{type:'LineString',coordinates:d}}
		f.properties.route_color = colors[i]
		feats.features.push(f);
	})
	
	console.log(feats);
	
	function distance(a,b){
		return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) )
	}
	var eqpts = [];
	for(var i = 0; i < feats.features.length; i++){
		for(var j = 0; j< feats.features.length; j++){
			if(j === i)
				continue;
			for(var irunner=0; irunner < feats.features[i].geometry.coordinates.length; irunner++){
				for(var jrunner=0; jrunner< feats.features[j].geometry.coordinates.length; jrunner++){
					var a = feats.features[i].geometry.coordinates[irunner];
					var b = feats.features[j].geometry.coordinates[jrunner];
					if( Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) ) === 0)
						eqpts.push(a);
				}
			}
		}
	}
	var circs = {
		type:'FeatureCollection',
		features:[
		]
	}
	eqpts.forEach(function(d){
		var f = {type:"Feature",properties:{route_id:"A",route_color:colors[i]},geometry:{type:'Point',coordinates:d}}
		circs.features.push(f);
	});
	console.log(circs);
	group.selectAll("circle").data(circs.features)
							.enter().append("circle")
							.attr("transform",function(d){
								return "translate("+projection(d.geometry.coordinates)+")"
							})
							.attr("id","j1")
							.attr("r","3")
							.style("fill","green")
							.style("stroke","black");
	var paths = group.selectAll("path").data(feats.features)
					.enter().append("path")
					.attr("id",function(d){return "route_"+d.properties.route_id;})
					.style("stroke",function(d){return "#"+d.properties.route_color;})
					paths.attr("d",path); 
	
	return geoJson.features;
}

function changeColors(){
	
}

tripData = {}
function getTripData(Route_ID,Day,AgencyID,Element){
	var tripURL = HOST+"/agency/routeSchedule?id="+AgencyID+"&day="+Day+"&route_id="+Route_ID;
	d3.json(tripURL,function(err,data){
		if(err) console.log(err);
		var beenPlotted = false;
			data.forEach(function(d){
				if(!tripData[d.trip_id])
					tripData[d.trip_id] = []
				tripData[d.trip_id].push(d);				
			})
		var trip_id = "B20140608WKD_001150_A..S74R";
		var froute = plotter(Route_ID,trip_id);
		setTrip(tripData,Element,froute,trip_id);
	})
}



function plotter(id,trip_id){
	var newRoutes = [];
	//console.log(Routes);

	var	newroute = getStops(id, Routes, pathcoll);
	var finalRoute = setShapes(newroute,tripData,trip_id);
	return finalRoute;
}