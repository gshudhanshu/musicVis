function RidgePlots(){
    this.name = "RidgePlots";
	this.datGui = {
		name: this.name,
		arcSize: 200
	}
	
    
    this.addPaneGui = function() {
		


    }

    this.removePaneGui = function(){
        paneFolder.dispose();
    }

	this.draw = function(){
		push();
		// var spectrum = fourier.analyze(this.bins);
		// var spectrum = fourier.smooth(0.8);
		var spectrum = fourier.analyze(this.datGui.bins);
		// console.log(spectrum);
		noStroke();

        arc(width/2, height*0.88,
             this.datGui.arcSize,
             this.datGui.arcSize,
             PI, TWO_PI);

		pop();
	};
}