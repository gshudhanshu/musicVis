//Contructor function for Spectrum Vis
function Spectrum(){
	this.name = "Spectrum";
	this.datGui = {
		name: this.name,
		bins: 64
	}
	// this.bins = 64;

	  this.addPaneGui = function(pane) {

		guiFolder = gui.addFolder("Spectrum"); 
		guiFolder.add(this.datGui, 'name').onChange(function (value) {
			this.datGui = value;
			// init();
		  });
	
		  guiFolder.add(this.datGui, 'bins', [8,32,64]).onChange(function (value) {
			// init();
		  });
    }

    this.removeDatGui = function(){
		gui.removeFolder(Spectrum)
    }

	this.draw = function(){
		push();
		// var spectrum = fourier.analyze(this.bins);
		// var spectrum = fourier.smooth(0.8);
		var spectrum = fourier.analyze(this.datGui.bins);
		// console.log(spectrum);
		noStroke();

		for(var i = 0; i<this.datGui.bins; i++){

			//fade the colour of the bin from green to red
			var g = map(spectrum[i], 0, 255, 255, 0);
			fill(spectrum[i], g, 255);

			//draw each bin as a rectangle from the left of the screen
			//bottop to top

			var x = map(i, 0, this.datGui.bins, width*0.15, width*0.85);
			var h = map(spectrum[i], 0, 255, 0, -height*0.7);

			rect(x, height*0.88, width*0.65/this.datGui.bins, h);
			rect(x, height*0.88, width*0.65/this.datGui.bins, -5);

		}  		
		pop();
	};
}

