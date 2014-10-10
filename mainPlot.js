/*This file will contain the main plotting logic for the transit maps*/

var W_height=window.outerHeight,
	W_width=window.outerWidth;

var currentAgency;
var routeGeo;
var stopGeo;
var projection, path,
geoJson, GeoData;

function getGraphData(Element,AgencyID){
	//We use the availabs api to retrieve route data of specified id
	var routeUrl = "http://api.availabs.org/gtfs/agency/"+AgencyID+"/routes";
	
	currentAgency = AgencyID;
	d3.json(routeUrl,function(err,data){
		if(err) console.log(err);

		console.log(data);
		routeGeo = data;
		plotGraph(Element,routeGeo);
		getStopData(AgencyID);
	});
}

function getStopData(AgencyID){
	var stopUrl = "http://api.availabs.org/gtfs/agency/"+AgencyID+"/stops";

	d3.json(stopUrl,function(err,data){
		if(err) console.log(err);

		console.log(data);
		stopGeo = data;
		plotStops(stopGeo);
	});	
}

function plotStops(StopData){

	var group = d3.select("#plot");
	var stops = topojson.feature(StopData,StopData.objects.stops);
	console.log(stops);

	var tip = d3.tip()
				.attr("class",'station')
				.offset([-10,0])
				.html(function(d){
					return "<strong>Station: </strong><span style='color:red'>" +d.properties.stop_name+"</span>";
				})

	group.selectAll(".stationLabel")
					.data(stops.features).enter().append("circle")
					.attr("class","stationLabel")
					.attr("transform",function(d){
						return "translate("+projection(d.geometry.coordinates)+")"
					})
					.attr("r","2.5");

	group.call(tip);

		d3.selectAll(".stationLabel")
					.on("mouseover",tip.show)
					.on("mouseout",tip.hide)
					

					
}

function plotGraph(Element,GeoData){
	var bbox = GeoData.bbox;
	var scale = .95/ Math.max( (bbox[3] - bbox[1])/W_width, (bbox[2] - bbox[0])/W_height  );

	console.log(bbox);
	console.log(scale);	

	geoJson = topojson.feature(GeoData,GeoData.objects.routes)
	projection = d3.geo.mercator()
            .center(GeoData.transform.translate)
            .scale(50*scale)
            
    path = d3.geo.path().projection(projection);
    var x1,x2,y1,y2,bounds;
    bounds = path.bounds(geoJson);
    /*Here we want to resize the image of the paths to fit the svg*/
    /*get the bounds of the figure*/
    x1 = bounds[0][0], x2 = bounds[1][0],y1 = bounds[0][1], y2 = bounds[1][1];
    /*set the frame of the svg to fit the size of our figure*/
    var height = y2-y1;
    var width = x2-x1;
	var svg = Element.append("svg")
				.attr("height",height+0.1*height)
				.attr("width", width + 0.1*width)
				.style("position","absolute")
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