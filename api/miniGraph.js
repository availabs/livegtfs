
var node = function(v){
	this.val = v;
	this.adjs = [];
	this.addadj = function(v){
		this.adjs.push(v);
	}
	this.isLinked = function(v){
		return this.adjs.indexOf(v) >= 0;
	}
}
var miniGraph = function(){
	this.nodes = {}
	this.queryEdge = function(v1,v2){
		if(this.nodes[v1] && this.nodes[v2]){
			return this.nodes[v1].isLinked(v2);
		}else{
			return false;
		}
	};
	this.addEdge = function(v1,v2){
		if(!this.queryEdge(v1,v2)){
			this.nodes[v1] = this.nodes[v1] || new node(v1);
			this.nodes[v2] = this.nodes[v2] || new node(v2);
			this.nodes[v1].addadj(v2);
			this.nodes[v2].addadj(v1);	
			return true;
		}else{
			return false;
		}
	};
}