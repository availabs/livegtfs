/*This  file will contain the main plotting logic for the transit maps*/
var HOST = "http://localhost:1337"
var W_height=window.outerHeight,
	W_width=window.outerWidth;

var currentAgency;
var projection, path,
geoJson, GeoData;


// function getTripData(Route_ID,Day,AgencyID){
// 	var tripURL = HOST+"/agency/routeSchedule?id="+AgencyID+"&day="+Day+"&route_id="+Route_ID;
// 	d3.json(tripURL,function(err,data){
// 		if(err) console.log(err);
// 		var beenPlotted = false;
// 			data.forEach(function(d){
// 				if(!tripData[d.trip_id])
// 					tripData[d.trip_id] = []
// 				tripData[d.trip_id].push(d);
// 				if( (d.trip_id == "R20130803WKD_000100_SI.S01R") && !beenPlotted  ){
// 					getTrip(tripData,"R20130803WKD_000100_SI.S01R");
// 					beenPlotted = true;
// 				}
// 			})
// 		console.log(tripData);
// 	})
// }

// function getTrip(Data,member){
// 	var startStation = d3.select("#plot");
// 	startStation.append("circle")
// 	.attr("class","trip")
// 	.attr("id",member)
// 	.attr("r","4")
// 	.attr("transform",d3.select("#S31S").attr("transform"));
	
// }



function getGraphData(Element,AgencyID,sliderCallback){
	//We use the availabs api to retrieve route data of specified id
	var routeUrl = HOST+"/agency/"+AgencyID+"/routes";
	
	currentAgency = AgencyID;
	d3.json(routeUrl,function(err,data){
		if(err) console.log(err);

		
		routeGeo = data;
		console.log(routeGeo);
		plotGraph(Element,routeGeo);
		getStopData(Element,AgencyID,sliderCallback);
	});
}

function getStopData(Element,AgencyID,sliderCallback){
	var stopUrl = "http://api.availabs.org/gtfs/agency/"+AgencyID+"/stops";

	d3.json(stopUrl,function(err,data){
		if(err) console.log(err);

		
		stopGeo = data;
		plotStops(stopGeo);
		sliderCallback(Element);
		
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
					.attr("class","stationLabel")
					.attr("id",function(d){return d.properties.stop_id;})
					.attr("transform",function(d){
						return "translate("+projection(d.geometry.coordinates)+")"
					})
					.attr("r","2.5")
					.style("fill","white")
					.style("stroke","black");

	group.call(tip);

		d3.selectAll(".stationLabel")
					.on("mouseover",tip.show)
					.on("mouseout",tip.hide)
					

					
}
/*{type:'Feature',properties:{}, geometry:test}*/
function plotGraph(Element,GeoData){
	var bbox = GeoData.bbox;
	var scale = .95/ Math.max( (bbox[3] - bbox[1])/W_width, (bbox[2] - bbox[0])/W_height  );
	

	/*var newJson = {type:'FeatureCollection',features:[]};
	GeoData.objects.routes.geometries.forEach(function(d){
		var routeSwap = {type: "GeometryCollection", geometries:[d]}
		var test = topojson.mesh(GeoData, routeSwap, function(a, b) { return true; });
		console.log(test,d.properties);
		var feature = {type:'Feature', properties:d.properties, geometry:{type:test.type, coordinates:test.coordinates}};
		newJson.features.push(feature);
	})*/
	
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

	var paths = group.selectAll("path").data(geoJson.features)
					.enter().append("path")
					.attr("id",function(d){return d.properties.route_id;})
					.style("stroke",function(d){return "#"+d.properties.route_color;})

					paths.attr("d",path); 
				

}

/*function cleanRoutes(routesGeo){

	routesGeo.features.map(function(route){

		if(typeof route.geometry != 'undefined' && route.geometry != null){
			if(route.geometry.type == 'MultiLineString'){
				var max = route.geometry.coordinates[0].length;
				var keep = route.geometry.coordinates[0];
				for(array in route.geometry.coordinates){
					if( array.length > max){
						max = array.length();
						keep = array;
					}
				}

				route.geometry.coordinates = [ union(route.geometry.coordinates)  ];
			}
		}

	})

}*/

/*function union(arrays){
	if(arrays == null || arrays.length == 0) //if we are given an empty list of arrays we return an empty array
		return [];
	var curunion = [];
	for(var i = 0; i<arrays.length; i++){// for every array in the list of arrays
		for(var j = 0; j< arrays[i].length; j++){ // for every element in the array
			if(!arrayExists(curunion,arrays[i][j] ) ) // if the element is in the current union 
				curunion.push(arrays[i][j]);         // add the element to the union.
		}
	}
	return curunion;
}

function arrayExists(array,subarray){
	var bool = array.every(function(element,index,array){
		return !areEqual(element,subarray);
	})
	return !bool;
}

function areEqual(array1, array2){
//assume similar structured array
	if(array1.length  != array2.length)
		return false;

	for(ind in array1){
		if(array1[ind] != array2[ind])
			return false;
	}	
	return true;
}*/