var Lext = (function(L){
	var addroutes = function(rdata,map){
		var bounds = [];
		bounds.push(rdata.bbox.splice(0,2).reverse());
		bounds.push(rdata.bbox.reverse());
		var stateLayer = L.geoJson(rdata, {} )
		stateLayer.addTo(map);
		map.fitBounds(bounds);
	}
	var addstops = function(sdata,map){
		var stopLayer = L.geoJson(sdata,{
   				pointToLayer: function (d, latlng) {
               		var options = {
                  
                   color: "#000",
                   weight: 3,
                   opacity: 1,
                   fillOpacity: 0.8,
                   stroke:false,
                   fillColor:'#a00',
                   radius:4
               };
               return L.circleMarker(latlng, options);
			    },
			    onEachFeature: function(f,layer){
			    	layer.bindPopup('<b>'+f.properties.stop_id+'</b><br/>'
			    					+f.properties.routes.join(' & '))
			    	layer.on('mouseover',function(e){
			    		this.openPopup();
			    	});
			    	layer.on('mouseout',function(e){
			    		this.closePopup();
			    	})
			    }
			})
   		stopLayer.addTo(map)
	}
	return {addroutes:addroutes,addstops:addstops}
})(L);

