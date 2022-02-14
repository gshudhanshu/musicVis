function RidgePlots(){
    this.name = "RidgePlots";
	this.datGui = {
		name: this.name,
		arcSize: 200
	}
	
    
    this.addDatGui = function() {
		
        var guiFolder = gui.addFolder("RidgePlots"); 



        guiFolder.add(this.datGui, 'name').onChange(function (value) {
			this.datGui = value;
			// init();
		  });
	
        guiFolder.add(this.datGui, 'arcSize', [150,200,300]).onChange(function (value) {
			// init();
		  });

    }

    this.removeDatGui = function(){
        gui.removeFolder();
        // console.log(gui)
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