function RidgePlots(){
    this.name = "Ridge Plots";
	this.panePARAMS = {
		name: this.name,
		arcSize: 400,
        scaleFactor: 1.5
	}
    
    this.addPaneGui = function() {
        paneFolder = pane.addFolder({title: this.panePARAMS.name});
        paneFolder.addInput(this.panePARAMS, 'arcSize', {
            min: 200,
            max: 600,
          });
          paneFolder.addInput(this.panePARAMS, 'scaleFactor', {
            min: 1,
            max: 3,
          });
    }

    this.removePaneGui = function(){
        paneFolder.dispose();
    }


	var startX = width/5;
	var  endY = height/5;
	var startY = height -endY
	var spectrumWidth = (width/5)*3
    var speed = 0.7;

    var output = [];

    // var fft = new p5.FFT();
    var fourier = new p5.FFT();
    
this.addWave = function(){
    
    // output.push([{x: startX, y: startY}, {x: startX +spectrumWidth, y: startY}])
	var w = fourier.waveform();
    console.log(w)
	var outputWave = [];
	var smallScale = 3; 2
	var bigScale = 40;

        for(var i = 0; i < w.length; i++) {

            if (i % 5 === 0) {
                var y;
                var x = map(i, 0, 1024, startX, startX + spectrumWidth)
                if(i < 1024 * 0.25 || i > 1024 * 0.75) {
                    y = map(w[i], - 1, 1, - smallScale, smallScale);
                    outputWave.push({
                        x: x,
                        y: startY + y
                    })
                }
                else {
                    y = map(w[i], -1, 1, -bigScale, bigScale);
                    outputWave.push({
                        x: x,
                        y: startY + y
                    })
                }
            }
	    }
	    output.push(outputWave);

    }

	this.draw = function(){
		push();
        
        background(0)
        noFill();
        stroke(255)
        strokeWeight(2)
        if(frameCount %30 === 0){
            this.addWave();
        }
    
        for(var i= 0; i< output.length; i++){
            var o = output[i]
            beginShape();
            for(var j = 0; j<o.length; j++){
                o[j].y -= speed;
                vertex(o[j].x, o[j].y);
            }
            endShape();
            if(o[0].y < endY){
                output.splice(i,1);
            }
        }

		fourier.analyze();
        var bass = fourier.getEnergy( "bass" );
        var mapBass = map( bass, 0, 255, 1, this.panePARAMS.scaleFactor);

        noStroke();
        arc(startX, startY,
            this.panePARAMS.arcSize*mapBass,
            this.panePARAMS.arcSize*mapBass,
             PI, TWO_PI);

		pop();
	};
}