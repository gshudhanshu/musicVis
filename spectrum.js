//Contructor function for Spectrum Vis
function Spectrum(){
	this.name = "Spectrum";
	this.panePARAMS = {
		name: this.name,
		bins: 64,
		colHeight: 70,
		lowFreqColor: {r: 0, g:215, b: 255},
		highFreqColor: {r: 255, g:50, b: 200}
	}

	//tweakpane GUI
	this.addPaneGui = function(pane) {
		paneFolder = pane.addFolder({
			title: this.panePARAMS.name,
		  });
		paneFolder.addInput(this.panePARAMS, 'bins', {
			options: {
			  16: 16,
			  32: 32,
			  64: 64,
			  128:128,
			  256:256,
			  512:512,
			},
		  });
		  paneFolder.addInput(this.panePARAMS, 'colHeight', {
			min: 0,
			max: 100,
		  });
		  paneFolder.addInput(this.panePARAMS, 'lowFreqColor');
		  paneFolder.addInput(this.panePARAMS, 'highFreqColor');
    }

	//Remove tweakpane GUI
    this.removePaneGui = function(){
		paneFolder.dispose();
    }

	this.setup = function() {   }

	// Draw function similar to P5.js
	this.draw = function(){
		colorMode(RGB, 255);
		push();
		var  spectrum = fourier.analyze(this.panePARAMS.bins);
		noStroke();


		for(var i = 0; i<this.panePARAMS.bins; i++){

			//fade the colour of the bin from green to red
			var r = map(spectrum[i],
				0, 255,
				this.panePARAMS.lowFreqColor.r, this.panePARAMS.highFreqColor.r);
			var g = map(spectrum[i],
				0,	255,
				this.panePARAMS.lowFreqColor.g, this.panePARAMS.highFreqColor.g);
			var b = map(spectrum[i],
				0, 255,
				this.panePARAMS.lowFreqColor.b, this.panePARAMS.highFreqColor.b);
			fill(r, g, b);

			//drawing each bin as a rectangle from the bottom of the screen

			var x = map(i, 0, this.panePARAMS.bins, width*0.15, width*0.85);
			var h = map(spectrum[i], 0, 255, 0, -height*this.panePARAMS.colHeight/100);

			rect(x, height*0.88, width*0.65/this.panePARAMS.bins, h);
			rect(x, height*0.88, width*0.65/this.panePARAMS.bins, -5);

		}  		
		pop();
	}
}

