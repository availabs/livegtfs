//livegtfsapi.js

var livegtfs = (function(){
	
	if(!d3 || !topojson){
		return undefined;
	}
	/////////////////////////////////////GraphModule//////////////////////////////////////
	var newRGraph = (function(){
				var Graph = function(){
						this.numEdges  = 0;   //private variable for the number of edges
						this.adjacencyLists = {};
					};
			
					var AdjacencyList = function(){
						this.list = new LinkedList();
					};
			
					AdjacencyList.prototype.add = function(obj){
						if(!this.list.exists(obj))
							this.list.add(obj);
					}
					AdjacencyList.prototype.remove = function(obj){
						this.list.remove(obj);
					}
					AdjacencyList.prototype.print = function(){
						this.list.print();
					}
			
					var Vertex = function(val){
						this.vertex = val; 		
					}
			
					Graph.prototype.addEdge = function(vertex1,vertex2){  //This function will add an edge to the graph given its endpoints
						if(vertex1 !== vertex2){
							this.adjacencyLists[vertex1] = this.adjacencyLists[vertex1] || new AdjacencyList();
							this.adjacencyLists[vertex2] = this.adjacencyLists[vertex2] || new AdjacencyList();
			
							this.adjacencyLists[vertex1].add(vertex2);
							this.adjacencyLists[vertex2].add(vertex1);
							this.numEdges += 1;
						}
						return this;
					}
			
					Graph.prototype.getVerticies = function(){
						return Object.keys(this.adjacencyLists);
					};
			
					Graph.prototype.toString = function(){
						var adjString = '';
						var current = null;
						var verticies = this.getVerticies();
						console.log(verticies.length + " verticies, " + this.numEdges + " edges");
						for(var i =0; i< verticies.length; i++){
							adjString = verticies[i] + ":";
							current = this.adjacencyLists[verticies[i]].list.listHead;
							while(current){
								adjString += " " + current.data;
								current = current.next;
							}
							console.log(adjString);
							adjString = '';
						}
						return this;
					};
			
					Graph.prototype.clearAdjacencies = function(vertex){
						var adjList = this.getAdjacencies[vertex] || null;
						if(adjList !== null){
							this.adjacencyLists[vertex] = new LinkedList();
						}
					}
			
					Graph.prototype.bridgeVerticies = function(v1,bridge,v2){
						var v1AdjList = this.adjacencyLists[v1].list || null;
						var v2AdjList = this.adjacencyLists[v2].list || null;
						this.adjacencyLists[bridge] = this.adjacencyLists[bridge] || (new LinkedList());
						var bridgeAdjList = this.adjacencyLists[bridge];
			
			
						if(v1AdjList !== null && v2AdjList !== null){
							v1AdjList.swap(v2,bridge);
							v2AdjList.swap(v1,bridge);
							if(!bridgeAdjList.list.exists(v1))
								this.adjacencyLists[bridge].list.add(v1);
							if(!bridgeAdjList.list.exists(v2))
			
								this.adjacencyLists[bridge].list.add(v2);
								
						}else{
							console.log("Error, unexpected vertex");
						}
					}
			
					Graph.prototype.getAdjacencies = function(vertex){
			
						var adjList = this.adjacencyLists[vertex] || (new AdjacencyList());
						var array = [];
						var tracer = adjList.list.listHead;
						while(tracer != null){  //while tracer isn't null
							array.push(tracer.data);
							tracer = tracer.next;
						}
						return array;
					}
			
			
					function dfs(Graph,start,end){
						var stack = new Stack();
						stack.push(start);
						var seenList = [];
						seenList.push(start);
						var parents = {};
						if(start === end){
							return [];
						}
						while(stack !== []){
							current = stack.pop();  //get the top of the stack
							if(current === end){	//if we found our point 
								var pathStack = [end];
								var child = end,parent = parents[child];
								pathStack.unshift(parent);	
								while(parent !== start){	//recreate path traversed with backwards parent map
								 	child = parent;
									parent = parents[child] || null;
									pathStack.unshift(parent);
								}
								return pathStack;		//return the stack
							}
							//if not get the adjacencies of current node
							var adjacencies = Graph.getAdjacencies(current); //get the Adjacencies of the current node
							seenList.push(current);  //mark it as seen
							for(var i=0; i< adjacencies.length; i++){  //for every node adjacent push it on the stack if unseen
								if(seenList.indexOf(adjacencies[i]) < 0){
									seenList.push(adjacencies[i]);
									stack.push(adjacencies[i]);
									parents[adjacencies[i]] = current;
								}
							}
						}
					}
			
					function bfs(Graph,source,target){
						var queue = [];      //initialize a queue
						var set = [];   //initialize the list of seen verticies
						var parents = {}
						queue.push(source);  // push it on the queue 
						set.push(source);  //push it on the of verticies that we are aware of
			
						while( queue.length != 0 ){  //while the queue is not empty
							var t = queue.splice(0,1)[0];   //get the first element in the queue
							if(t === target){				//if the  current vertex is the one we are looking for stop
								var pathStack = [target];
								var child = target, parent = parents[child];
								pathStack.unshift(parent);
								while(parent !== source){
									child = parent;
									parent = parents[child];
									pathStack.unshift(parent);
								}
								return pathStack;
							}
							var adjacencies = Graph.getAdjacencies(t);   // if not get the vertexes adjacent to this node
							adjacencies.forEach(function(vert){          // for each of them
								if(set.indexOf(vert) < 0){			 	 // if we are aware of them, ignore as they are already set to be evaluated 
									queue.push(vert);					 // if not, add them to the queue
									set.push(vert);						 // the set
									parents[vert] = t;					 // and the mapping of parent nodes for reconstruction
								}
							});
						}
						console.log("No Match Found");
						return [];
					}
			
				var Stack = function(){
					this.stack = [];
				}
				Stack.prototype={
					length:function(){return this.stack.length;},
					push:  function(obj){this.stack.push(obj);},
					pop:   function(){
								var ret = this.stack[this.length()-1];
								this.stack = this.stack.slice(0,this.length()-1);
					 			return ret;
					 			},
					toList: 	function(){ return this.stack;}
				}
			
			
			
				var LinkedList = function(){
					this.length =0;
					this.listHead = null;
				};
			
				LinkedList.prototype.add = function(obj){
			
					var node = {
						data:obj,
						next:null
					};
					var current = this.listHead;
					if(this.listHead === null)
						this.listHead = node;
					else{
						while(current.next != null){ //loop till next node is empty
							current = current.next;
						}
						//once it is empty set that link to the node;
						current.next = node;
					}
					//increment the length of the list
					this.length += 1;
					return this;
				};
			
				LinkedList.prototype.remove = function(obj){
					var current = this.listHead;
					if(current.data === obj){ 					//if it matches the first object just set it to the rest of the list
						this.listHead = current.next;
						this.length -= 1; 
						return this
						;
					}else{
						while(current && current.next.data !== obj){ //loop through the list until we fall off or find a match
							current = current.next;
						}
						if(current.next.data === obj){  		// if we found a match then just skip over it to the next link
							current.next = current.next.next;
						}
					}
					if(current){  								//if we didn't fall off the list we decrement the length of the list
						this.length -= 1;
					}
					return this;
				};
			
				LinkedList.prototype.print = function(){
					var tracer = this.listHead; //start at the beginning
					while(tracer){				//while tracer isn't null continue
						console.log(tracer.data);
						tracer = tracer.next;
					}
				}
			
				LinkedList.prototype.exists = function(obj){
					var tracer = this.listHead;
					while(tracer){
						if(tracer.data === obj)
							return true;
						tracer = tracer.next;
					}
					return false;
				}
			
				LinkedList.prototype.swap = function(el, newEl){
					var tracer = this.listHead;
					while(tracer){
						if(tracer.data === el){
							tracer.data = newEl;
						}
						tracer = tracer.next;
					}
			
				}
			
				var newRGraph = function(){
						var RouteGraphs = {
							numRoutes:0,
							Routes:{},
							addRoute:function(route_id){
								if(!this.Routes[route_id]){
									this.Routes[route_id] = new Graph();
									this.numRoutes++;
								}
							},
							printRouteGraph:function(route_id){
								if(this.Routes[route_id])
									this.Routes[route_id].toString();
								else
									console.log("Graph does not exist");
							},
							getRouteNodes:function(route_id){ // useful for debugging
								if(this.Routes[route_id])
									return this.Routes[route_id].getVerticies();
								else
									console.log("Graph does not exist");

							},
							addEdgeToRoute:function(route_id,v1,v2){
								this.addRoute(route_id);
								this.Routes[route_id].addEdge(v1,v2);
								return this;
							},
							getShortestPath:function(route_id,source,target){
								var shortestPath;
								if(!this.Routes[route_id]){
									return [];
								}
								else{
									shortestPath = bfs(this.Routes[route_id],source,target);
								}
								return shortestPath;
							}	
						};
						return RouteGraphs;
					}
					return newRGraph;
	})();
	////////////////////////////////////EndGraphModule////////////////////////////////////

	////////////////////////////////////segmentTree///////////////////////////////////////
	var segmentTree = function() {
		/*
	   * interval-query
	   * Copyright © 2012, Thomas Oberndörfer <toberndo@yarkon.de>
	   * MIT Licensed
		*/
		"use strict";  
		  var root = null;
		  
		  var intervals = [];
		  
		  var Interval = function(from, to, inter) {
		    this.id = ++Interval.prototype.id;
		    this.from = from;
		    this.to = to;
		    this.overlap = {};
		    if(typeof inter !== 'undefined'){   //////djv edit;
			   this.inter = inter;
		    }
		  }
		  
		  Interval.prototype.id = 0;
		  Interval.const = Interval.prototype;
		  Interval.prototype.SUBSET = 1;
		  Interval.prototype.DISJOINT = 2;
		  Interval.prototype.INTERSECT_OR_SUPERSET = 3;
		  
		  Interval.prototype.compareTo = function(other) {
		    if (other.from > this.to || other.to < this.from) return this.DISJOINT;
		    if (other.from <= this.from && other.to >= this.to) return this.SUBSET; 
		    return this.INTERSECT_OR_SUPERSET;
		  }
		  
		  // endpoints of intervals included
		  Interval.prototype.disjointIncl = function(other) {
		    if (other.from > this.to || other.to < this.from) return this.DISJOINT;
		  }
		  
		  // two intervals that share only endpoints are seen as disjoint
		  Interval.prototype.disjointExcl = function(other) {
		    if (other.from >= this.to || other.to <= this.from) return this.DISJOINT;
		  }
		  
		  var Node = function(from, to) {
		    this.left = null;
		    this.right = null;
		    this.segment = new Interval(from, to);
		    this.intervals = [];
		  }
		  
		  var endpointArray = function() {
		    var endpoints = [];
		    endpoints.push(-Infinity);
		    endpoints.push(Infinity);
		    intervals.forEach(function(item) {
		      endpoints.push(item.from);
		      endpoints.push(item.to);
		    });
		    return sortAndDeDup(endpoints, function(a, b) {
		      return (a - b);
		    });
		  }
		  
		  var sortAndDeDup = function(unordered, compFn) {
		    var result = [];
		    var prev;
		    unordered.sort(compFn).forEach(function(item) {
		      var equal = (compFn !== undefined && prev !== undefined) ? compFn(prev, item) === 0 : prev === item; 
		      if (!equal) {
		        result.push(item);
		        prev = item;
		      }
		    });
		    return result;
		  }
		  
		  var insertElements = function(pointArray) {
		    var node;
		    if (pointArray.length === 2) {
		      node = new Node(pointArray[0], pointArray[1]);
		      if (pointArray[1] !== Infinity) {
		        node.left = new Node(pointArray[0], pointArray[1]);
		        node.right = new Node(pointArray[1], pointArray[1]);
		      }
		    } else {
		      node = new Node(pointArray[0], pointArray[pointArray.length - 1]);
		      // split array in two halfs
		      var center = Math.floor(pointArray.length / 2);
		      node.left = insertElements(pointArray.slice(0, center + 1));
		      node.right = insertElements(pointArray.slice(center));
		    }
		    return node;
		  }
		  
		  var insertInterval = function(node, interval) {
		    switch(node.segment.compareTo(interval)) {
		      case Interval.const.SUBSET:
		        // interval of node is a subset of the specified interval or equal
		        node.intervals.push(interval);
		        break;
		      case Interval.const.INTERSECT_OR_SUPERSET:
		        // interval of node is a superset, have to look in both childs
		        if (node.left) insertInterval(node.left, interval);
		        if (node.right) insertInterval(node.right, interval);
		        break;
		      case Interval.const.DISJOINT:
		        // nothing to do
		        break;
		    }
		  }
		  
		  var traverseTree = function(node, enterFn, leaveFn) {
		    if (node === null) return;
		    // callback when enter node
		    if (enterFn !== undefined) enterFn(node);
		    traverseTree(node.right, enterFn, leaveFn);
		    traverseTree(node.left, enterFn, leaveFn);
		    // callback before leave
		    if (leaveFn !== undefined) leaveFn(node);
		  }
		  
		  var tree2Array = function(node, level, array) {
		    if (node === null) return;
		    if (level === undefined) level = -1;
		    if (array === undefined) array = [];
		    level++;
		    if (!array[level]) array[level] = [];
		    array[level].push(node);
		    tree2Array(node.right, level, array);
		    tree2Array(node.left, level, array);
		    return array;
		  }
		  
		  var _query = function(node, queryIntervals, hits, disjointFn) {
		    if (node === null) return;
		    queryIntervals.forEach(function(queryInterval) {
		      if (disjointFn.call(node.segment, queryInterval) !== Interval.const.DISJOINT) {
		        node.intervals.forEach(function(interval) {
		          hits[interval.id] = interval;
		        });
		        _query(node.right, queryIntervals, hits, disjointFn);
		        _query(node.left, queryIntervals, hits, disjointFn);
		      }
		    });
		  }
		  
		  var _queryInterval = function(intervalArray, resultFn, disjointFn) {
		    var hits = {};
		    if (disjointFn === undefined) disjointFn = Interval.prototype.disjointIncl;
		    _query(root, intervalArray, hits, disjointFn);
		    var intervalArray = Object.keys(hits).map(function(key) {
		      return hits[key];
		    });
		    if (resultFn !== undefined && typeof resultFn === 'function') resultFn(intervalArray);
		    return intervalArray.length;
		  }
		  
		  var _exchangeOverlap = function(intervals, superiorIntervals) {
		    for(var i = 0; i < superiorIntervals.length; i++) {
		      var superiorInterval = superiorIntervals[i];
		      for(var j = 0; j < intervals.length; j++) {
		        intervals[j].overlap[superiorInterval.id] = superiorInterval;
		        superiorInterval.overlap[intervals[j].id] = intervals[j]; 
		      }
		    }
		    // intervals of node overlap with each other
		    for(var i = 0; i < intervals.length; i++) {
		      for(var j = i + 1; j < intervals.length; j++) {
		        intervals[i].overlap[intervals[j].id] = intervals[j];
		        intervals[j].overlap[intervals[i].id] = intervals[i]; 
		      }
		    }
		  }
		  
		  var _queryOverlap = function(node, topOverlap) {
		    if (node === null) return;
		    var localTopOvrlp;
		    // exchange overlaps: all intervals of a node overlap with intervals of superior nodes and vice versa
		    if (node.intervals.length !== 0) {
		      _exchangeOverlap(node.intervals, topOverlap);
		      // create topOverlap array with new intervals from node
		      localTopOvrlp = topOverlap.concat(node.intervals);
		    } else {
		      localTopOvrlp = topOverlap;
		    }
		    _queryOverlap(node.left, localTopOvrlp); 
		    _queryOverlap(node.right, localTopOvrlp); 
		  }
		  
		    var validateInterval = function(from, to) {
		    if (typeof from !== 'number' || typeof to !== 'number') throw {
		        name: 'InvalidInterval',
		        message: 'endpoints of interval must be of type number'
		    };
		    if (from > to) throw {
		        name: 'InvalidInterval',
		        message: '(' + from + ',' + to + ')' + ' a > b'
		    };
		  }
		  
		  var validateIntervalArray = function(from, to) {
		    if (!(from instanceof Array && to instanceof Array)) throw {
		        name: 'InvalidParameter',
		        message: 'function pushArray: parameters must be arrays'
		    };
		    if (from.length !== to.length) throw {
		        name: 'InvalidParameter',
		        message: 'function pushArray: arrays must have same length'
		    };
		    for(var i = 0; i < from.length; i++) {
		      validateInterval(from[i], to[i]);
		    }
		  }
		  
		  var validatePoint = function(point) {
		    if (typeof point !== 'number') throw {
		        name: 'InvalidParameter',
		        message: 'parameter must be a number'
		    };
		  }
		  
		  var validatePointArray = function(points) {
		    if (!(points instanceof Array)) throw {
		        name: 'InvalidParameter',
		        message: 'parameter must be an array'
		    };
		    for(var i = 0; i < points.length; i++) {
		      if (typeof points[i] !== 'number') throw {
		        name: 'InvalidParameter',
		        message: 'array must consist only of numbers'
		      }
		    }
		  }
		  
		  return {
		    pushInterval: function(from, to, inter) {
		      validateInterval(from, to);			///djv edit
		      intervals.push(new Interval(from, to, inter));
		    },
		    pushArray: function(from, to, validate) {
		      var val = (validate !== undefined) ? validate : true;
		      if (val) validateIntervalArray(from, to);
		      for(var i = 0; i < from.length; i++) {
		        intervals.push(new Interval(from[i], to[i]));
		      }
		    },
		    clearIntervalStack: function() {
		      intervals.length = 0;
		      Interval.prototype.id = 0;
		    },
		    buildTree: function() {
		      if (intervals.length === 0) throw { name: 'BuildTreeError', message: 'interval stack is empty' };
		      root = insertElements(endpointArray());
		      intervals.forEach(function(item) {
		        insertInterval(root, item);
		      });
		    },
		    printTree: function() {
		      traverseTree(root, function(node) {
		        console.log('\nSegment: (%d,%d)', node.segment.from, node.segment.to);
		        node.intervals.forEach(function(item, pos) {
		          console.log('Interval %d: (%d,%d)', pos, item.from, item.to);
		        });
		      });
		    },
		    printTreeTopDown: function() {
		      tree2Array(root).forEach(function(item, pos) {
		        console.log('Level %d:', pos);
		        item.forEach(function(item, pos) {
		          console.log('Segment %d: (%d,%d)', pos, item.segment.from, item.segment.to);
		          item.intervals.forEach(function(item, pos) {
		            console.log('  Interval %d: (%d,%d)', pos, item.from, item.to);
		          });
		        });
		      });
		    },
		    queryPoint: function(point, resultFn) {
		      validatePoint(point);
		      return this.queryPointArray([point], resultFn);
		    },
		    queryPointArray: function(points, resultFn, validate) {
		      var val = (validate !== undefined) ? validate : true;
		      if (val) validatePointArray(points);
		      var intervalArray = points.map(function(item) {
		        return new Interval(item, item);
		      });
		      return _queryInterval(intervalArray, resultFn);
		    },
		    // options: endpoints, resultFn
		    queryInterval: function(from, to, options) {
		      validateInterval(from, to);
		      return this.queryIntervalArray([from], [to], options);
		    },
		    // options: endpoints, resultFn, validate
		    queryIntervalArray: function(from, to, options) {
		      var intervalArray = [];
		      var val = (options !== undefined && options.validate !== undefined) ? options.validate : true;
		      var resFn = (options !== undefined && options.resultFn !== undefined) ? options.resultFn : undefined;
		      var disjointFn = (options !== undefined && options.endpoints === false) ? Interval.prototype.disjointExcl : Interval.prototype.disjointIncl;
		      if (val) validateIntervalArray(from, to);
		      for(var i = 0; i < from.length; i++) {
		        intervalArray.push(new Interval(from[i], to[i]));
		      }
		      return _queryInterval(intervalArray, resFn, disjointFn);
		    },
		    queryOverlap: function() {
		      _queryOverlap(root, []);
		      var result = [];
		      intervals.forEach(function(interval) {
		        var copy = new Interval();
		        copy.id = interval.id;
		        copy.from = interval.from;
		        copy.to = interval.to
		        copy.overlap = Object.keys(interval.overlap);
		        result.push(copy);
		      });
		      return result;
		    }
		  }
	}
	///////////////////////////////////EndSegmentTree/////////////////////////////////////

	///////////////////////////////////gtfsDataMod////////////////////////////////////////
	var gtfsDataMod = (function(){
		function reqUndef(varb,name){
			if(udef(varb)){
				console.log(name+' is required');
				return true;
			}
			return false;
		}
		function isFunc(foo){
			if(typeof foo === 'function')
				return true;
			return false;
		}
		function haveReqFunc(foo){
			if(!isFunc(foo)){
				console.log('must include callback');
				return false;
			}
			return true;

		}
		function udef(varb){
			if(typeof varb === 'undefined')
				return true;
			return false;
		}
		function callback(cb,args){
			try{
				cb(args);	
			}catch(e){
				console.error(e.name+':',e.message);
			}
		}

		var test = false;
		var HOST = "http://localhost:1337"
			var getRoutesData = function getRoutesData(AgencyID,cb){
				//We use the availabs api to retrieve route data of specified id
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(haveReqFunc(cb))
					var routeUrl = HOST+"/agency/"+AgencyID+"/routes";
				else
					return
				if(test){
					routeUrl = 'sampleRoutes.json';
				}
				currentAgency = AgencyID;
				d3.json(routeUrl,function(err,data){
					if(err) console.log(err);
					routeGeo = data;
					callback(cb,data);
				});
			};

			var getSegmentData = function getSegmentData(AgencyID,cb){
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(haveReqFunc(cb))
					var segUrl = HOST+'/agency/'+AgencyID+'/segmentData';
				else
					return
				currentAgency = AgencyID;
				d3.json(segUrl,function(err,data){
					if(err) console.log(err);
					callback(cb,data);
				})
			};

			var getStopsData = function getStopsData(AgencyID,opts){
				if(reqUndef(AgencyID,'AgencyID'))
					return;		
				var stopUrl = HOST+"/agency/"+AgencyID+"/stops";
				if(opts){
					if(test){
						stopUrl = 'sampleStops.json';
					}
					var route_id = (typeof opts.routearg === 'string')? routearg: undefined;
					if(!udef(route_id)){
						stopUrl += '?'+ route_id;
					}
				}
				var cb = arguments[arguments.length-1];     //callback will always be the last one
				if(!haveReqFunc(cb))
					return;

				d3.json(stopUrl,function(err,data){			//use d3 to fetch data
					if(err) console.log(err);
					if(opts.Type && opts.Type === 'FeatureCollection'){
						var stops = topojson.feature(data,data.objects.stops);
						stops.bbox = data.bbox; stops.transform = data.transform;
						callback(cb,stops);
					}else{
						callback(cb,data);	
					}
					
				});	
			}

			var getTripsData = function getTripsData(AgencyID,Day,Route_ID,cb){
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(reqUndef(Day,'Day'))
					return;
				if(reqUndef(Route_ID,'Route_ID'))
					return;

				var cb = arguments[arguments.length-1];
				if(!haveReqFunc(cb))
					return;
				var tripURL = HOST+'/agency/'+AgencyID+'/routes/'+Route_ID+'/schedule?day='+Day;

				d3.json(tripURL,function(err,data){
					if(err) console.log(err);
					callback(cb,data);
				})
			};


		var movementTest = false;
			var getRouteTripsData = function getRouteTripsData(AgencyID, Day){
				if(reqUndef(AgencyID,'AgencyID'))
					return;
				if(reqUndef(Day,'Day'))
					return;

				var cb = arguments[arguments.length-1];
				if(!haveReqFunc(cb))
					return;
				var route_id = arguments[2];
				var tripURL = HOST+"/agency/"+AgencyID+"/day/"+Day+"/routeData";
				if(!udef(route_id) && route_id !== cb)
					tripURL += '?routeId='+route_id;

				if(movementTest){
					tripURL = 'MONDAY.json';
				}
				d3.json(tripURL,function(err,data){
					if(err) console.log(err);
					callback(cb,data);
				})
			};

			return {
				'getRoutes': getRoutesData,
				'getStops' : getStopsData,
				'getTrips' : getTripsData,
				'getRouteTrips' : getRouteTripsData,
				'getSegmentData':getSegmentData
			}

	})();
	///////////////////////////////////EndGtfsDataMod/////////////////////////////////////

	///////////////////////////////////PlotMod////////////////////////////////////////////
	var plotMod = function(Element){

		var HOST = "http://localhost:1337"
		var W_height=window.outerHeight,
			W_width=window.outerWidth;

		
		var plotCalcs = function(Data,plotId,scaleFactor){
			var group = d3.select('#'+plotId);
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
						.enter().append("path").filter(function(d){if(RouteId){return d.properties.route_id === RouteId} return true})
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
			var plotObj = plotCalcs(stops,plotId,scaleFactor);
			var group = plotObj.group;
			var projection = plotObj.projection;

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
							.data(stops.features).enter().append("circle").filter(function(d){
											if (RouteID){ 
												var match = false; 
												d.properties.routes.forEach(function(d){ 
													if(d === RouteID) 
														match = true;
												}); 
												return match
											} 
											return true
										})
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
							.on("mouseover",tip.show)
							.on("mouseout",tip.hide)
					
			return plotObj;
		};
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



		function distance(a,b){
			return Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) );
		}
	};
	///////////////////////////////////EndPlotMod/////////////////////////////////////////

	///////////////////////////////////Pather/////////////////////////////////////////////
	var pather = (function(){


		var graph = newRGraph()

		var getPathCollection = function getPathCollection(routes,stations){
			var pathCollection = []

			routes.forEach(function(d){  //for each route
				var pathElement = {pathID:d.properties.route_id, stations: []} //create a element for the collection
				stations.forEach(function(station){   //search through the stations 
					station.properties.routes.forEach(function(route){
						if(route === d.properties.route_id)             //if one has the same id
							pathElement.stations.push(station);   //add it to the element list	
					})
					
				})
				pathCollection.push(pathElement);			 //add the current element to the collection
			})
			return pathCollection
		}

		var getStops = function getStops(route_id, Routes,pathCollection){
			var curRoute;
			Routes.forEach(function(route){
				if(route.properties.route_id == route_id)
					curRoute = route;
			})

			var stops = [];
			pathCollection.forEach(function(path){
				if(path.pathID == route_id)
					stops = path.stations;
			})

			curRoute["stops"] = stops;
			return curRoute;
		}

		
		var getRouteSegs = function setShapes(newRoute){
			var currentBin,index;
			var routeSegments = {
				type:'FeatureCollection',
				features:[]
			};
			var splitList = [];
			var realStops = getStations(newRoute.stops);
			//trueStops = getTrueStops(newRoute.geometry,realStops);

			var ret = getAllLines(newRoute.geometry,realStops);
			var segmentsArr = ret.list;
			var plotObj;
			routeSegments = mergeSegments(segmentsArr);
			

			return {routeSegments:routeSegments};

					function deepCopy(obj){
						return JSON.parse(JSON.stringify(obj));
					}

					function mergeSegments(SegmentList){
						var mergedFeatureCollection = {
							type:'FeatureCollection',
							features:[]
						};
						SegmentList.forEach(function(d){
							d.features.forEach(function(feature){
								mergedFeatureCollection.features.push(feature);
							})
						})
						return mergedFeatureCollection
					}
					function toMultiLineString(FeatureCollection){
						var features = FeatureCollection.features;
						var mlsObj = {geometry:{coordinates:[]},type:"MultiLineString"};
						features.forEach(function(feature){
							mlsObj.geometry.coordinates.push(feature.geometry.coordinates);
						})
						return mlsObj;
					}

					function getAllLines(MultiLineString,stops){
						var LIST = []   
						var lines;
						var ret;
						MultiLineString.coordinates.forEach(function(d,i){
							if(d.length != 0){
								ret = getLines(d,stops,graph); 
								LIST.push(ret.lines);
							}
						})
						//var collection = mergeSegments(LIST);
						return {list:LIST};
					}
						
					function getStations(stops){
						var uniqueStations = [];
						var exists = false;
						for(var i = 0; i< stops.length; i++){
							var station = {'type':'Feature','properties':{'station_name':'' , 'stop_ids':[]}, 'geometry':stops[i].geometry};
							for(var j=0; j< uniqueStations.length; j++){
								exists = false;
								if(nparse(uniqueStations[j].properties.stop_ids[0] ) === nparse(stops[i].properties.stop_id) ){
									uniqueStations[j].properties.stop_ids.push(stops[i].properties.stop_id)
									exists = true;
									break;
								}
							}
							if(!exists){
								station.properties.station_name = stops[i].properties.stop_name;
								station.properties.stop_ids.push(stops[i].properties.stop_id);
								uniqueStations.push(station);
							}
							
						}
						return uniqueStations;
					}
					

					function getRange(array,start,stop){
						if(start < 0){
							start = 0;
						}
						retArray = [];
						   //must include endpoints if it needs to interpolate!!!!!!
						retArray = array.slice(start,stop+1);
						
						return retArray;
					}
					function findStop(stopcoor,lineString){
						var index = -1;
							for(var i =0; i< lineString.length; i++){
								var coor = lineString[i];
									var d = distance(coor,stopcoor);
									if(d === 0){
										index = i;
										break;

									}
							}
						
						return index;
					}
					function findStopsAtPoint(point,stoplist){
						var list = [];
						stoplist.forEach(function(d,i){	
							if(distance(d.geometry.coordinates,point)===0)
								{
									list.push(i);
								}
								
							})
						return list;
					}

					function getSet(lineString,realStops){
					   		var listOfStops = [];
					   		realStops.forEach(function(d){
					   			if(findStop(d.geometry.coordinates,lineString) >= 0)
					   				listOfStops.push(d);
					   		})
					   		return listOfStops;
					   	}

					function getLines(lineString, realStops,graph){
						var builder = function(newRoute,range,start,end,graph){
							var obj = {
										'type':'Feature',
										'properties':newRoute.properties,
										'geometry':{
											'type':'LineString',
											'coordinates':range
										},
										
									};
									obj.properties.start = start;
									obj.properties.end = end;
									graph.addEdgeToRoute(newRoute.properties.route_id,
														nparse(start.properties.stop_ids[0]),
														nparse(end.properties.stop_ids[0])
														);
									return obj;
						}
				 		var trueStops = getSet(lineString,realStops);  ///get all stops that lie and the current lineString
						var startIndexes = findStopsAtPoint(lineString[0],trueStops); //find all stops that lie and the initial point
						var starts = [];
						startIndexes.forEach(function(index){			
							starts.push(trueStops[index]);				//for each one push it onto the stack of stops that need to be addressed
						})
						var routeSegments = {
							type:'FeatureCollection',
							features:[]
						};

						var lines = []     						//array of linestrings
													 	
						var lastIndex = 0;
						var rcode = newRoute.properties.route_id;
							for(var i = 0; i< lineString.length; i++){ //run through every point on the line string;
								var tempIndexes;					//create temp vars to hold immediately subsequent stops
								var temps = [];
								if( (tempIndexes = findStopsAtPoint(lineString[i],trueStops)).length !== 0 ){ //find the stops at our current point if they exist
									
									tempIndexes.forEach(function(index){
										temps.push(trueStops[index]);			//push them on the stack
									})
									
									var range;
									if(trueStops === [])
										range = [];
									else
										range = getRange(lineString,lastIndex, i);//get the range of points on the lineString that lie between start and end points
									if(range.length <2)	
										continue
									lastIndex = i;
									
									if(starts !== []){
										starts.forEach(function(start){			  //for each stop in the starting points
											temps.forEach(function(end){		  //for each stop in the ending points   ... i.e. cross product
												//create a lineString Feature object with the same properties as the route with current start and stop stations.
												var obj = deepCopy(builder(newRoute,range,start,end,graph));
												routeSegments.features.push(obj);   //add that path to our list of segments;
											})
										});
									}else{
										temps.forEach(function(end){
											range = getRange(lineString,0,i)
											
											var start = {
													'properties':{
															'routes':[rcode],
															'stop_code':null,
															'stop_ids':[nparse(end.properties.stop_ids[0])+'start'],
															'stop_name':'end'},
															'geometry':{type:'Point',coordinates:lineString[0]} };
											
										});
										var obj = deepCopy(builder(newRoute,range,start,end,graph));
										routeSegments.features.push(obj);
									}
									starts = temps;   //set the new starting node
									startIndexes = tempIndexes;
								}
								
							}
							// we have broken out of the loop so if there was a stop at the end
							// last index should be the last point in the linestring
							
							if(lastIndex !== lineString.length-1){ // if not
								range = getRange(lineString,lastIndex,i);
								starts.forEach(function(start){
									var end = {
										'properties':{
											'routes':[rcode],
											'stop_code':null,
											'stop_ids':[nparse(start.properties.stop_ids[0])+'end'],
											'stop_name':'end'
											},
											'geometry':{
												type:'Point',
												coordinates:lineString[lineString.length]
											} 
										};
									var obj = deepCopy(builder(newRoute,range,start,end,graph));
									routeSegments.features.push(obj);   //add that path to our list of segments;
								})									
							}	
							return {'lines':routeSegments};	
						}


			
		}

		var nrGen = function(routes,stops){
				pathcoll = getPathCollection(routes,stops);
				return function(id){
						var	newroute = getStops(id, routes, pathcoll);
						var routeSegments = getRouteSegs(newroute).routeSegments;
						return routeSegments;
				};
			}


			function findJunctions(feats){
			var eqpts = [];
			feats.forEach(function(d){
				var matrix = d.geometry.coordinates; 			//we have a multiline string so we start with a matrix of points
				for(var i = 0; i < matrix.length; i++){  		//loop through each linestring
					for(var j = 0; j< matrix.length; j++){	//compare it with all linestrings ahead of it
						for(var irunner=0; irunner < matrix[i].length; irunner++){ //compare each point in i's linestring
							start = (i !== j)? 0:irunner+1 
							for(var jrunner=start; jrunner< matrix[j].length; jrunner++){ //to each point of j's linestring
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
										if(eqpts[index].properties.routes.indexOf(d.properties.route_id)<0)
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

		var junctionUtil = {};
		junctionUtil.getJuncs = function getJuncs(RouteData){
			return findJunctions(RouteData.features);
		};
		junctionUtil.mergeJuncs = function mergeJuncs(stops,junctions){
			for (var i =0; i< junctions.length; i++){
				var junc = junctions[i].geometry.coordinates;
				var exists = false;
				stops.features.forEach(function(d,i){
					if (distance(d.geometry.coordinates,junc) === 0){
						exists = true;
					} 
				})
				//if (!exists){
					stops.features.push(junctions[i]);
				//}
			}
		}

		function distance(a,b){
			var d =  Math.sqrt( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] ) * ( a[1] - b[1] ) );
			// if(d === 0)
			// 	return d;
			// if(d < 0.002){
			// 	console.log("anomoly");	
			// 	return 0;
			// }
			return d;
		}
		return {junctionUtil:junctionUtil,getPathCollection:getPathCollection,getStops:getStops,getRouteSegs:getRouteSegs,nrGen:nrGen,graph:graph}
	})();
	//////////////////////////////////EndPather//////////////////////////////////////////

	//////////////////////////////////pathPlotter////////////////////////////////////////
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
						+nparse(d.properties.start.properties.stop_ids[0])+"_e_"+nparse(d.properties.end.properties.stop_ids[0]);
					return str;
					
					})


					.style("stroke",function(d){var color = d.properties.route_color; if(color){return '#'+color;} return '#000' })
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

		var checkSettings = function(settings){
			if(typeof settings === 'undefined' ||  (typeof settings.path === 'undefined' && typeof settings.data.transform === 'undefined') ){
				throw {
						name:'UsageError',
						message: 'need existing plot settings or data defined transform and bounding box'
					};
			}
		}

		var plotSegments = function(segData,settings,id){
			var routeIds = Object.keys(segData), path;
			checkSettings(settings);
			if(typeof settings.path === 'undefined'){
				path = plotCalcs(settings.data,settings.plotId,settings.scaleFactor).path;
			}else{
				path = settings.path;
			}
			if(!id){
				routeIds.forEach(function(id){
					if(segData[id].features.length > 0)
						plotNewRoute(segData[id],path);
				})
			}else{
				if(routeIds.indexOf(id) < 0)
					console.log('Unknown Route')
				else if(segData[id].features.length > 0)
					plotNewRoute(segData[id],path);
				else
					console.log('Empty Route')
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

		
		return {plotPaths:plotPathedRoutes,plotSegs:plotSegments};

	})()
	///////////////////////////////////EndpathPlotter//////////////////////////////////////////

	///////////////////////////////////Mover//////////////////////////////////////////////
	var mover = (function(){
		var tripRanges = {
			ranges:{},
			addRanges:function(rangeObj){
				var keys = Object.keys(rangeObj);
				var ranges = this.ranges
				keys.forEach(function(tripid){
					ranges[tripid] = rangeObj[tripid];
				})
			},
			getRanges:function(){
				return this.ranges;
			}
		}



		function parseTime(s) {
		   	  var formatTime = d3.time.format("%X");
			  var t = formatTime.parse(s);
			  // if (t != null && t.getHours() < 5) t.setDate(t.getDate() + 1);
			  return t;
		}		

			var slider = function(){
				var HOST = "http://localhost:1337"


				function getMaxOfArray(numArray){
					return Math.max.apply(null,numArray);
				}

				var buildSlider = function buildSlider(Element,start,end){

					var formatTime = d3.time.format("%X");
					var isClock = false;
					var margin = {top: 50, right: 200, bottom: 50, left: 200},
					    width = 120 - margin.left - margin.right,
					    height = 750- margin.bottom - margin.top;
					var buffer = 20;

					var y = d3.time.scale()
					    .domain([parseTime(start), parseTime(end)])
					    .range([0, height])
					    .clamp(true);

					var brush = d3.svg.brush()
					    .y(y)
					    .extent([parseTime(start),parseTime(end)])
					    .on("brush", brushed);
					var div = Element.append("div");
						div.attr("id","sliderDiv")
							.style("float","left");
					var svg = div.append("svg")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  	.append("g")
					   	.attr("transform", "translate(" +buffer+ "," + 0 + ")")
					
					    
					svg.append("g")
					    .attr("class", "y axis")
					    .attr("transform", "translate(0,"+margin.top+")")
					    .call(d3.svg.axis()
					      .scale(y)
					      .orient("right")   //this says align axis vertically with labels on right
					      .ticks(32)
					      .tickSize(0)
					      .tickFormat(formatTime)
					      .tickPadding(12))
					  .select(".domain")
					  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
					    .attr("class", "halo");

					var slider = svg.append("g")
					    .attr("class", "slider")
					    .attr("transform", "translate(0,"+margin.top+")")
					    .call(brush);

					slider.selectAll(".extent,.resize")
					    .remove();

					slider.select(".background")
						.attr("width","50");
					    
					var handle = slider.append("circle")
					    .attr("class", "handle")
					    .attr("transform", "translate(0,"+0+")")
					    .attr("r", 9);

					  //  slider
					  //   .call(brush.event)
					  // .transition() // gratuitous intro!
					  //   .duration(750)
					  //   .call(brush.extent([parseTime("5:30AM"),parseTime("5:30AM")]))
					  //   .call(brush.event);

					



					function brushed() {
					  var value = brush.extent()[0];
					  if (d3.event.sourceEvent) { // not a programmatic event
					  	mouse = d3.mouse(this)[1];
					    value = y.invert(d3.mouse(this)[1]);
					    brush.extent([value, value]);
					  }

					  handle.attr("cy", y(value));
					  setTime(value);
					  moveTrip(value,y);
					}


					function setTime(time){
						if( !isClock){
							var div = d3.select("body").append("div");
								div.append("h3").attr("id","clock");
								div.style("float","left");
							isClock = true;
						}
						var clock = d3.select("#clock");

						if (time instanceof Date){
							time = formatTime(time)	
						}
						clock.text( "Current Time: "+time )
					}
					
				}
				return {buildSlider:buildSlider}
			}

			function moveTrip(value,map){
				var intervalList = {},rangeList = [],keeper = getKeeper();
				var v = timeToInt(d3.time.format('%X')(value));
				var segTree = getIntTree(), rangeTree = getRangeTree();
				segTree.queryPoint(v,function(results){
					results.forEach(function(result){
						var id = result.inter.name;
						intervalList[id] = result.inter.interval;
					})
				})
				rangeTree.queryPoint(v,function(results){
					results.forEach(function(result){
						var trip_id = result.inter;
						if(!intervalList[trip_id])
							rangeList.push(trip_id);
					});
				});
				if(intervalList){
					var activeTrips = Object.keys(intervalList);
					activeTrips = activeTrips.concat(rangeList);
					keeper.filter(activeTrips);
					var trips = d3.select("#plot").selectAll(".trip").data(activeTrips);
					trips.enter().append("circle")
					trips.attr("class","trip")
					trips.attr("id",function(d){
						return correctID(d);})
					trips.attr("r","4")
					trips.exit().remove()
					trips.attr("transform",function(d){
						var interval = intervalList[d];
						if(interval){ 
							var identifier = '.'+interval.lineClass+'#_s_'+interval.start_id+'_e_'+interval.stop_id
							var path1 = d3.select(identifier).node();
							var reverse = false;
							if(path1 === null)
							{
								identifier = '.'+interval.lineClass+'#_s_'+interval.stop_id+'_e_'+interval.start_id
								path1 = d3.select(identifier).node();
								if( path1 === null)
									return 'translate(50,50)';
								reverse = true;
							}

							var length = path1.getTotalLength();   //get length of the curve
							var shift = parseTime(interval.start).getTime();
							var	time = (value.getTime()-shift)/(parseTime(interval.stop).getTime() - shift);   //calc % point in time interval
							
							if(!isFinite(time*length)){
								return "translate(50,50)";
							}
							var p;
							if(reverse)
								p = path1.getPointAtLength(length-time*length);
							else
								p = path1.getPointAtLength(time*length);             //find that % point along the curve
							var temp = "translate(" + p.x+"," + p.y+")"; 
							keeper.add(d,temp);
							return temp;
						}
						else{
							return keeper.query(d);
						}

							
							

					});
				}
				function correctID(d){
					return d.replace(/\./g,'_');
				}
			}

			var getKeeper = (function(){
				var keepMap = {};
				return function(){
					return {
						add:function(key,value){
							keepMap[key] = value; 
						},
						clear:function(){
							keepMap = {}
						},
						query:function(key){
							return keepMap[key];
						},
						filter:function(keyList){
							newMap = {};
							keyList.forEach(function(k){
								if(keepMap[k])
									newMap[k] = keepMap[k];
							})
							keepMap = newMap;
						}

					}
				}
			})();

			function getInitialTrips(Intervals){
				var tripArray; 
			}
			var getIntTree = (function(){
				var segTree = segmentTree();
				return function(){return segTree};	
			} )();
			var getRangeTree = (function(){
				var rangeTree = segmentTree();
				return function() {return rangeTree};
			})();



			function timeToInt(time){
				var place = 1;
				var val = 0;
				for(var i = time.length-1; i>=0; i--){
					var d = parseInt(time[i]);
					if(!isNaN(d)){
						val += d*place;
						place = place * 10;
					}
				}
				return val;
			}
			var tripSetter =(function(){ 
				var built = false;
				var isBuilt = function(){return built};
				var setBuilt = function(){built = true};

				return {
					setTrip:function(Element,data,times){
						var segTree = getIntTree();
						var rangeTree = getRangeTree();
						if(arguments[3]){
							parseRouteData(data.intervalObj['route_'+arguments[3]],segTree,rangeTree);
						}else{
						 	parseRouteData(data,segTree,rangeTree);	
						}
						segTree.buildTree();
						rangeTree.buildTree();
						var s = slider(); 
						if(!isBuilt()){
							if(times)
								s.buildSlider(Element,times.start,times.end);
							else
								s.buildSlider(Element,'09:00:00','17:30:00');
							setBuilt();
						}
					}
				}
			})();

			function parseRouteData(data,segTree,rangeTree){
				if(typeof data.intervalObj !== 'undefined'){
					data = data.intervalObj;
					var routes = Object.keys(data);
						routes.forEach(function(route){
							parseTripData(data[route].trips,segTree,rangeTree);
						})
				}else{
					parseTripData(data.trips,segTree,rangeTree);
				}

			}
			function parseTripData(trips,segTree,rangeTree){
				var keys = Object.keys(trips);
				keys.forEach(function(trip){
							trips[trip].intervals.forEach(function(interval){
								var start = timeToInt(interval.start);
								var end = timeToInt(interval.stop);
								if(start<end){
									intervalObj = {name:trip,interval:interval};
									segTree.pushInterval(start,end,intervalObj);
								}
							})
							var begin = timeToInt(trips[trip].range.begin);
							var end = timeToInt(trips[trip].range.end);
							if(begin < end){
								rangeTree.pushInterval(begin,end,trip);
							}

						})
			}

			function getTripRanges(routeIntervals){
				var keys = Object.keys(routeIntervals);
				var ranges = {}
				keys.forEach(function(id){
					var currentRoute = routeIntervals[id];
					tripKeys = Object.keys(currentRoute);
					tripKeys.forEach(function(k) {
						ranges[k] = currentRoute[k].range;	
					})
					 
				})
				return ranges;
			}

			var TimeObj = function(){
					this.start_id='';
					this.stop_id = '';
					this.start='';
					this.stop = '';
					this.lineID = '';
					this.lineClass='';
				}

			var intervalStructure = {
				intervalObj:{},
			// 	addIntervals:function (tripData,RouteData,route_id){
			// 		this.intervalObj[route_id] = getAllRouteIntervals(tripData,RouteData,route_id)();
			// 	},

				getIntervals:function(){
					return this.intervalObj;
				}
			}

			return {tripSetter:tripSetter}
	})();
	///////////////////////////////////EndMover///////////////////////////////////////////



	return {'gtfsData':gtfsDataMod, 'plotter':plotMod, 'pather':pathPlotter, 'mover':mover, other:pather};

})();