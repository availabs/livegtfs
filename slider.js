/*This file will contain the main display and movement
	logic for the time slider*/

function buildSlider(){

	d3.select("body").append("div")
		.attr("class","slider");
		.attr("id","timeSlide");
		.style("height","100px"),
		.style("width","400px");

	d3.select("#timeSlide").append("svg");
	//guide http://bl.ocks.org/mbostock/6452972

}