ALGORITHM_MODULE.dsu_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "dsu-tab";
    var algorithmName = "Disjoint Set Union";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded dsu");

    _my.AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, "graphs-1-dsu");
 
    var row0 = d3.select("#algoContainer")
	.append("div").attr("class", "tab-pane").attr("id", algorithmTabId)
        .append("div").attr("class", "container-fluid")
	.append("div").attr("class", "row")

    var leftPanel = row0.append("div").attr("class", "col-md-7")
    var controlsPanel = leftPanel.append("div").attr("class", "row")
	.append("div").attr("class", "col-md-12")
	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");
    var ops = controlsPanel.append("div").attr("class", "panel-body")
	.append("div").attr("class", "options");
    _my.AlgorithmUtils.insertDefaultControls(ops, algorithmTabId);

    var treeNodesPanel = leftPanel.append("div").attr("class", "row")
	.append("div").attr("class", "col-md-12")
	.append("div").attr("class", "panel panel-default");
    treeNodesPanel.append("div").attr("class", "panel-heading").text("Algorithm Visualization");
    treeNodesPanel.append("div").attr("class", "panel-body graphics");
     var codePanel = row0.append("div").attr("class", "col-md-5")
	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");

    
    /*******************************/
    /*      Setup the svg stuff    */
    /*******************************/
    //var width = 1400;
    var treew = 200;
    var treeh = 450;
    var nodeRadius = 32;
    var margin = { left: 0, top: (1.5 * nodeRadius), right: 10, bottom: 100};

    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width", 1000)
	.attr("height", treeh + 10)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var coin_image_src = new Image();
    coin_image_src.src = "assets/coin_flip.gif";
    var coin_image = d3.select("#" + algorithmTabId + " .graphics").select("svg").append("g").attr("class", "coin")	
	.append("image")
	.attr("x", -110 + margin.left)
	.attr("y", -110 + margin.top)
	.attr("width", 220)
	.attr("height", 220)
	.attr("display", "none");

    var next_num = 5;
    var data = [];
    for (var j = 0; j < next_num; j++) {
	data.push({"name": j});
    }

    // the dsu find and union functions
    function find(a, data) {
	var ptr = a;
	while(data[ptr].root != ptr) {
	    ptr = data[ptr].root;
	}
	return ptr;
    }
    function union (a, b, data, find_function) {
	var r1 = find_function(a, data);
	var r2 = find_function(b, data);
	if(r1 !== r2) {
	    if(data[r1].rank > data[r2].rank) {
		data[r2].root = r1; 
	    }
	    else if(data[r1].rank < data[r2].rank) {
		data[r1].root = r2;
	    }
	    else {
		var prob = Math.random();
		if(prob > 0.5) {
		    data[r1].root = r2;
		    data[r2].rank++;
		}
		else {
		    data[r2].root = r1;
		    data[r1].rank++;  
		}
	    }
	}
    }

    /**
     * tree rendering function, called to draw a d3 tree hierarchy 
     */
    function drawTreeFun(data, i, child) {

	var animation_duration = 1000;
	var tree = d3.layout.tree().size([treew - margin.right, treeh - margin.bottom])
	    .children(function(d) {
		return d.children;
	    });
	var nodes = tree.nodes(data);
	var links = tree.links(nodes);


	var diagonal = d3.svg.diagonal();
	var movers = d3.selectAll(".dsu-link-g")
	    .data(links, function (d) { return d.source.name + "-to-" + d.target.name })
	
	movers.transition()
	    .duration(animation_duration)
	    .attr("transform", "translate(" + data.order*treew + ",0)");

	movers.select(".dsu-link")
	    .transition()
	    .duration(animation_duration)
	    .attr("d", diagonal)

	var svgLinks = svg.selectAll(".dsu-link")
	    .data(links, function (d) { return d.source.name + "-to-" + d.target.name })
	    .enter()
	    .append("g")
	    .attr("class", "dsu-link-g")
	    .attr("transform", "translate(" + data.order*treew + ",0)")
	    .append("path")
	    .attr("class", "dsu-link")
	    .attr("id", function(d) { return "from-" + d.source.name + "-to-" + d.target.name; })
	    .transition()
	    .delay(animation_duration)
	    .attr("d", diagonal);

	var mover_nodes = svg.selectAll(".dsu-node")
	    .data(nodes, function(d) { return d.name; })
	    .transition()
	    .duration(animation_duration)
	    .attr("transform", function(d) {return "translate(" + (d.x + data.order*treew) + "," + d.y + ")";});

	var svgNodes = svg.selectAll(".dsu-node")
	    .data(nodes, function(d) { return d.name; })
	    .enter().append("g")
	    .attr("class", "dsu-node")
	    .attr("id", function(d) { return "dsu-node-" + d.name; })
            .attr("transform", function(d) {return "translate(" + (d.x + data.order*treew) + "," + d.y + ")";});

	
	var circles = svgNodes.append("circle")
	    .attr("cx", 0)
	    .attr("cy", 0)
	    .attr("r", "0")
	    .transition() //transitioning from 0em to 2em
	    .delay(animation_duration)
	    .duration(animation_duration)
	    .attr("r", nodeRadius);

	var texts = svgNodes.append("text")
	    .attr("class", "dsu-node-name")
            .attr("dx", function(d) {var num = ("" + d.name).length; return (num * -5);})
            .attr("dy", "5")
	    .attr("onmousedown", "return false;")
	    .text(function(d) { return d.name; })
	    .attr("font-size", "0")
	    .transition()
	    .delay(2*animation_duration)
	    .attr("font-size", "16");

	var rankInfos = svgNodes.append("text")
	    .attr("class", "dsu-node-rank")
            .attr("dx", (nodeRadius))
            .attr("dy", (-nodeRadius))
	    .attr("onmousedown", "return false;")
	    .text(function(d) { return "Rank = " + d.rank; })
	    .attr("font-size", "0")
	    .transition()
	    .delay(2*animation_duration)
	    .attr("font-size", "12");

	// in svg the order of elements defines the z-index 
	// we added a moveToFront function to d3.selection that changes the order of elements
	setTimeout(function() {
	    svg.select("#dsu-node-" + data.name).moveToFront();
	    if (child != undefined) svg.select("#dsu-node-" + child.name).moveToFront();
	}, animation_duration + 10);

	return 2*animation_duration;
    }

    function push(obj, elem) {
	(obj.children = obj.children || []).push(elem);
    }
    function cleanup(winner_num, loser_num) {
	var winner = d3.select("#dsu-node-" + winner_num).datum();
	var loser = d3.select("#dsu-node-" + loser_num).datum();
	//remove_merged_nodes([winner_num,loser_num]);
	push(winner, loser);
	drawTreeFun(winner, winner_num, loser);
	var loser_order = loser.order;
	var new_node = {"name": next_num, "rank": 0, "root": next_num, "children": [], "order": loser_order};
	data.push(new_node);
	var animation_duration = drawTreeFun(_my.AlgorithmUtils.clone(new_node), next_num);
	next_num++;

	return animation_duration;
    }

    var cbsFind = {};
    var cbsUnion = {};

    // processing and enhancing the data
    d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
	    this.parentNode.appendChild(this);
	});
    };

    // data is the global container of nodes used by the code
    //linearize and add "rank"/"root" and "order" which determines where they will be drawn
    data.forEach(function(d) {
	d.rank = 0;
	d.root = d.name;
	d.order = +d.name;
	if (!("children" in d)) {
	    d.children = [];
	}
    });

    cbsFind[2] = function(ptr, data) {
	setTimeout(function() {
	    d3.select("#from-" + data[ptr].root + "-to-" + ptr).classed("highlight-elem", true);
	}, this.AlgorithmContext.default_animation_duration);
	return this.AlgorithmContext.default_animation_duration;
    }
    cbsFind[3] = function(ptr, data) {
	setTimeout(function() {
	    d3.select("#dsu-node-" + ptr).classed("highlight-elem", true);
	}, this.AlgorithmContext.default_animation_duration);
	return this.AlgorithmContext.default_animation_duration;
    }
    cbsUnion[2] = function(r1,r2,a,b) {
	return this.AlgorithmContext.default_animation_duration;
    }
    cbsUnion[3] = function(data, r1, r2) {
	d3.select("#dsu-node-" + r1).select(".dsu-node-rank").transition()
	    .attr("dx","-30")
	    .attr("dy","60")
	    .style("font-size", "26");
	d3.select("#dsu-node-" + r2).select(".dsu-node-rank").transition()
	    .attr("dx","-30")
	    .attr("dy","60")
	    .style("font-size", "26");
    }
    cbsUnion[5] = function(b, r1, r2, data) {
	d3.select("#dsu-node-" + r2).select(".dsu-node-rank").transition().remove();
	return cleanup(r1, r2);
    }
    cbsUnion[8] = function(a, r2, r1, data) {
	d3.select("#dsu-node-" + r1).select(".dsu-node-rank").transition().remove();
	return cleanup(r2, r1);
    }
    cbsUnion[13] = function(r2, r1, data) {
	return cleanup(r2, r1);
    }
    cbsUnion[14] = cbsUnion[18] = function(r2, r1, data) {
	var a = r1, b = r2;
	if (data[r2].rank > data[r1].rank) {
	    a = r2;
	    b = r1;
	}
	d3.select("#dsu-node-" + a).select(".dsu-node-rank").transition().text("Rank = " + data[a].rank);
	d3.select("#dsu-node-" + b).select(".dsu-node-rank").transition().remove();
	return 0;
    }
    cbsUnion[4] = cbsUnion[7] = cbsUnion[11] = function(data, r2, r1, prob) {

	var animation_duration = 4*this.AlgorithmContext.default_animation_duration;
	var transition_duration = this.AlgorithmContext.default_animation_duration;

	var data_r1 = d3.select("#dsu-node-" + r1).datum();
	var data_r2 = d3.select("#dsu-node-" + r2).datum();

	var xoff = ((data_r1.x + data_r1.order*treew) + (data_r2.x + data_r2.order*treew))/2 + 20;
	var yoff = data_r1.y + 60;
	var z1 = (data_r1.order < data_r2.order) ? r1 : r2;
	var z2 = (data_r1.order < data_r2.order) ? r2 : r1;
	var cmp_result = (data[z1].rank < data[z2].rank) ? 1 : (data[z1].rank > data[z2].rank) ? -1 : 0;
	var selfie = this;

	if (cmp_result == 1) {
	    svg.append("g").attr("class", "cmp_result").attr("transform", "translate(" + xoff + "," + yoff + ")").append("text").text("<");
	}
	else if (cmp_result == -1) {
	    svg.append("g").attr("class", "cmp_result").attr("transform", "translate(" + xoff + "," + yoff + ")").append("text").text(">");
	}
	else {
	    coin_image.attr("xlink:href", coin_image_src.src).attr("transform", "translate(" + xoff + "," + yoff + ")").attr("display", "block");
	    setTimeout(function() {
		coin_image.attr("display", "none");
	    }, animation_duration);

	}

	d3.select("#dsu-node-" + r1).select(".dsu-node-rank").transition().delay(animation_duration).duration(transition_duration)
	    .attr("dx", (nodeRadius))
            .attr("dy", (-nodeRadius))
	    .style("font-size", "8");
	d3.select("#dsu-node-" + r2).select(".dsu-node-rank").transition().delay(animation_duration).duration(transition_duration)
	    .attr("dx", (nodeRadius))
            .attr("dy", (-nodeRadius))
	    .style("font-size", "8");
	setTimeout(function() {
	    d3.select("g.cmp_result").remove();
	}, animation_duration);

	return animation_duration + transition_duration;
    }
    cbsUnion[17] = function(r1, r2, data) {
	return cleanup(r1, r2);
    }
    cbsUnion[21] = function(r1, r2, data) {
	d3.selectAll(".dsu-link").classed("highlight-elem", false);
	d3.selectAll(".dsu-node").classed("highlight-elem", false);
	return this.AlgorithmContext.default_animation_duration;
    }
    // this object determines the behaviour of the algorighm code
    var algorithmContext = {
	// animation duration for row highlights
	default_animation_duration : 500,
    };

    var dsuFind = new _my.Algorithm(find, cbsFind, "dsu-find-code", algorithmContext);
    var dsuUnion = new _my.Algorithm(union, cbsUnion, "dsu-union-code", algorithmContext, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    });


    d3.select("#" + algorithmTabId + " .code")
	.append("div")
	.attr("class", "dsu-find-code")
        .append("div")
	.attr("class", "function-code-holder")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(dsuFind);

    d3.select("#" + algorithmTabId + " .code")
	.append("div")
	.attr("class", "dsu-union-code")
        .append("div")
	.attr("class", "function-code-holder")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(dsuUnion);


    function kickOff(executionFunction) {
	/* The function that starts the simulation.
	 * It creates a dialog and the dialog starts the execution
	 */
	var dialog_obj = {
	    title:"Start set union", 
	    message: '<p>Click "Proceed" and select two graph nodes by clicking on them.</p>' +
		'<p>The visualization will start after two nodes have been clicked</p>',
	    buttons: {
		success: {
		    label: "Proceed",
		    className: "btn-success",
		    callback: function() {
			svg.selectAll(".dsu-node").on("click", function(d) {selectNode(this, d);});
			/**
			 * node selection function, triggered when user clicks on a circle
			 */
			var selected = [];
			var select_mode = true;
			function selectNode(svgObj, d) {
			    //this is used to determine whether nodes can be selected or not
			    if (!select_mode) {
				return;
			    }
			    svgObj.setAttribute("class", "dsu-node highlight-elem");
			    selected.push({"data":d, "obj":svgObj});
			    if (selected.length == 2) {
				select_mode = false;
				setTimeout(function() { 	    
				    var selected1 = selected[0].data.name;
				    var selected2 = selected[1].data.name;
				    var findInClosure = function(node, data) {
					return dsuFind.runWithSharedAnimationQueue(dsuUnion, node, data);
				    }
				    dsuUnion.startAnimation(selected1, selected2, data, findInClosure);
				    selected = [];
				    // remove the click function
				    svg.selectAll(".dsu-node").on("click", function() {});
				    executionFunction();
				}, 200);
			    }
			};
		    }
		},
		cancel: {
		    label: "Cancel",
		    className: "btn-primary",
		    callback: function() {
		    }
		}
	    }
	};

	bootbox.dialog(dialog_obj);
    };
    _my.AlgorithmUtils.attachAlgoToControls(dsuUnion, algorithmTabId, kickOff);

    /*calls google-prettify to make the code look nice
      called automatically
    */
    //$(function(){prettyPrint()});
    // we set the viewBox parameters here since this is when the divs are ready (dom ready)
    data.forEach(function(d) { d.rank = 0;});
    data.forEach(function(d, i) {
	drawTreeFun(_my.AlgorithmUtils.clone(d), i);
    });

    return {"find": find, "union": union,  "find-algorithm": dsuFind, "union-algorithm": dsuUnion};

})(ALGORITHM_MODULE, $, d3, bootbox);
