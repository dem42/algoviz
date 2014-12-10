var FFT_A = (function chart() {
    var algorithmTabId = "fft-tab";
    var algorithmName = "Fast Fourier Transform";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded fft");


    AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, "fft");
    
    var row0 = d3.select("#algoContainer")
    	.append("div").attr("class", "tab-pane").attr("id", algorithmTabId)
        .append("div").attr("class", "container-fluid")
    	.append("div").attr("class", "row")
    var leftPanel = row0.append("div").attr("class", "col-md-4")
    var controlsPanel = leftPanel.append("div").attr("class", "row controls")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");

    var leftPanelBody = controlsPanel.append("div").attr("class", "panel-body");
    var ops = leftPanelBody.append("div").attr("class", "options");
    AlgorithmUtils.insertDefaultControls(ops, algorithmTabId);
    AlgorithmUtils.insertCustomControls(ops, algorithmTabId, algorithmName);
    
    var visPanel = leftPanel.append("div").attr("class", "row")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    visPanel.append("div").attr("class", "panel-heading").text("Algorithm Visualization");
    visPanel.append("div").attr("class", "panel-body graphics");

    var codePanel = row0.append("div").attr("class", "col-md-8")
    	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");

    
    
    /*******************************/
    /*      Functions              */
    /*******************************/
    var Complex = {};
    Complex.create = function Complex(r, i) {
	if (this.constructor != Complex) {
	    return new Complex(r,i);
	}
	this.real = r;
	this.imaginary = i;
	this.toString = function() {return "(" + this.real + ", " + this.imaginary + ")"};
    };
    Complex.ZERO = Complex.create(0,0);

    Complex.add = function add(a, b) {
	if (a == undefined && b == undefined) {
	    return Complex.create(0,0);
	}
	if (a == undefined) {
	    return b;
	}
	if (b == undefined) {
	    return a;
	}
    	return Complex.create(a.real + b.real,a.imaginary + b.imaginary);
    };

    Complex.sub = function sub(a, b) {
	if (a == undefined && b == undefined) {
	    return Complex.create(0,0);
	}
	if (a == undefined) {
	    return b;
	}
	if (b == undefined) {
	    return a;
	}
	return Complex.create(a.real - b.real, a.imaginary - b.imaginary);
    };

    Complex.mult = function mult(a, b) {
	if (a == undefined || b == undefined) {
	    return Complex.create(0,0);
	}
	return Complex.create(a.real*b.real - a.imaginary*b.imaginary, a.real*b.imaginary + a.imaginary*b.real);
    };

    Complex.calc_unity = function calc_unity(idx, N, Complex) {
	return Complex.create(Math.cos((2*Math.PI*idx) / N), Math.sin((2*Math.PI*idx) / N));
    };
    
    function FFT(p, q, eval_at_roots_of_unity, Complex) {
	console.log(p, q);
    	var N = p.length > q.length ? p.length : q.length;
    	var outN = 2*N - 1;
    	var helper_arr = [];
	console.log("step 0 done");
    	eval_at_roots_of_unity(p, outN, 0, helper_arr, Complex);
	console.log("step 1 done");
    	eval_at_roots_of_unity(q, outN, 0, helper_arr, Complex);
	console.log("step 2 done");
    	var res = [];
    	for (var i=0; i < outN; i++) {
    	    res[i] = Complex.mult(p[i], q[i]);
	    console.log(p[i],q[i], res[i], i);

    	}
    	eval_at_roots_of_unity(res, outN, 0, helper_arr, Complex);
	console.log("step 3 done", res);
    	// rearrange roots of unity
    	// for (var i=1; i < N; i++) {
    	//     var temp = res[i];
    	//     res[i] = res[outN + 1 - i];
    	//     res[outN + 1 - i] = temp;
    	// }
    	for (var i=0; i < outN; i++) {
    	    res[i].real = (res[i]).real / (outN + 1);
    	}
	return res;
    }

    function eval_at_roots_of_unity(poly, len, start, helper_arr, Complex) {
	console.log(len, start, poly);
    	if (len <= 2) {
    	    var temp0 = poly[start];
    	    var temp1 = poly[start+1];
    	    poly[start] = Complex.add(temp0, temp1);
    	    poly[start+1] = Complex.sub(temp0, temp1);
    	}
    	else {
	    var half_len = Math.floor((len + 1)/2);
	    console.log("before perm", len, start);
	    for(var z = start; z < len; z++) {
		console.log("before perm..", poly[z]);
	    }
    	    for(var i=0; i < half_len; i++) {
    		var x = start + 2*i;
    		helper_arr[i] = poly[x];
    		helper_arr[i + (half_len)] = poly[x+1];
    	    }
	    console.log("permuted", helper_arr, len, start);
	    for(var z = start; z < len; z++) {
		console.log("permuted..", helper_arr[z]);
	    }
    	    for(var i=0; i < len; i++) {
    		poly[start + i] = helper_arr[i];
    	    }
    	    eval_at_roots_of_unity(poly, half_len, start, helper_arr, Complex);
    	    eval_at_roots_of_unity(poly, len - half_len, start + half_len, helper_arr, Complex);
	    console.log("before eval", poly, len, start);
	    for(var z = start; z < len; z++) {
		console.log("before eval..", poly[z]);
	    }
    	    for (var i=0; i < (len / 2); i++) {
		console.log(poly[start + half_len + i], poly[start + half_len + i], Complex.calc_unity(i, len, Complex));
    		var temp = Complex.mult(Complex.calc_unity(i, len, Complex),  poly[start + half_len + i]);
    		helper_arr[i] = Complex.add(poly[start + i], temp);
    		helper_arr[i + half_len] = Complex.sub(poly[start + i], temp);
    	    }
    	    for(var i=0; i < len; i++) {
    		poly[start + i] = helper_arr[i];
    	    }
	    console.log("after eval", poly, len, start);
	    for(var z = start; z < len; z++) {
		console.log("after perm..", poly[z]);
	    }
    	}
    }

    var ev = new Algorithm(eval_at_roots_of_unity, {}, "eval-code", {default_animation_duration : 800}); 
    var calc = new Algorithm(Complex.calc_unity, {}, "calc-code", {default_animation_duration : 100}); 
    var fft_call = [];
    fft_call[20] = function(res) { 
	res.forEach(function(d) { console.log(d.toString()); });
    };
    var fft = new Algorithm(FFT, fft_call, "fft-code", {default_animation_duration : 100}); 
    var poly_ev = [Complex.create(1,0), Complex.create(2,0), Complex.create(3,0)];
    var poly_p = [Complex.create(1,0), Complex.create(4,0)];
    var poly_q = [Complex.create(2,0), Complex.create(3,0)];
    console.log("after creating arrays", poly_p, poly_q, Complex, Complex.create);

    // we need a kickoff function that will start the algorithm
    function kickoff(executionFunction) {
	console.log("Before fft", poly_p, poly_q);
	var sharedEv = function(poly, len, start, helper_arr, Complex) {
	    return ev.runWithSharedAnimationQueue(fft, poly, len, start, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    return calc.runWithSharedAnimationQueue(ev, idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	//var result = fft.startAnimation(poly_p, poly_q, sharedEv, Complex);
	var result = ev.startAnimation(poly_ev, poly_ev.length, 0, [], Complex);
	console.log("After fft", result);
	executionFunction();
    };
    // we attach the kickoff to the default controls
    AlgorithmUtils.attachAlgoToControls(ev, algorithmTabId, kickoff);

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "calc-code")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(calc.toString());

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "eval-code")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(ev.toString());

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "fft-code")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(fft.toString());

    return {FFT : FFT, Complex : Complex, eval_at_roots_of_unity : eval_at_roots_of_unity};
})();
