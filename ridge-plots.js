//Contructor function for ridge-plots Vis
function RidgePlots(){
    this.name = "Ridge Plots";
	this.panePARAMS = {
		name: this.name,
		arcSize: 400,
        scaleFactor: 1.5,
        maxRadius:500,
        speed: 0.7,
        lineGap: 30,
        smallScale:5,
        bigScale:50,
        ampFactor: 3
	}
    
    this.addPaneGui = function() {
        paneFolder = pane.addFolder({title: this.panePARAMS.name});
        var arcShape = paneFolder.addFolder({ title: 'Arc Shape' })
        var arcLines = paneFolder.addFolder({ title: 'Arc Lines' })
        arcShape.addInput(this.panePARAMS, 'arcSize', {
            min: 200,
            max: 600,
          });
        arcShape.addInput(this.panePARAMS, 'scaleFactor', {
            min: 1,
            max: 3,
          });

        arcLines.addInput(this.panePARAMS, 'maxRadius', {
            min: 100,
            max: 1000,
        });

        arcLines.addInput(this.panePARAMS, 'speed', {
            min: 0.1,
            max: 2,
        });

        arcLines.addInput(this.panePARAMS, 'lineGap', {
            min: 5,
            max: 60,
            step: 1
        });

        arcLines.addInput(this.panePARAMS, 'ampFactor', {
            min: 1,
            max: 7,
            step: 0.5
        });

    }

    this.removePaneGui = function(){
        paneFolder.dispose();
    }

	var startX = width/2;
	var startY = height/2
    var output = [];
    var fourier = new p5.FFT(0.4, 1024);
    
this.addWave = function(){
    
    // output.push([{x: startX, y: startY}, {x: startX +spectrumWidth, y: startY}])

    var w = fourier.waveform();
    var radius = this.panePARAMS.arcSize/2;

	var outputWave = [];

        for(let i = 0; i < w.length; i++) {

            if (i % 20 === 0) {
                var degree = map(i, 0, w.length, 0, 180);
                var waveVal;

                if(i < 1024 * 0.05 || i > 1024 * 0.95) {
                    waveVal = map(w[i], - 1, 1, - this.panePARAMS.smallScale, this.panePARAMS.smallScale);
                }
                else {
                    waveVal = map(w[i], -1, 1, -this.panePARAMS.bigScale, this.panePARAMS.bigScale);
                }

                outputWave.push({
                    radius: radius,
                    degree: degree,
                    waveVal: waveVal
                })
            }

	    }
	    output.push(outputWave);

    }

    this.setup = function() {   }

	this.draw = function(){
        colorMode(RGB, 255);
        angleMode(DEGREES);
		push();
        
        background(0)
        noFill();
        stroke(255)
        strokeWeight(2)
        if(frameCount % this.panePARAMS.lineGap === 0){
            this.addWave();
        }
    
        for(var i= 0; i< output.length; i++){
            var o = output[i]
            var degree= 0
            beginShape();
            for(var j = 0; j<o.length; j++){
                o[j].radius +=this.panePARAMS.speed
                o[j].x = startX+(o[j].radius+o[j].waveVal*this.panePARAMS.ampFactor)*cos(o[j].degree+180);
                o[j].y = startY+(o[j].radius+o[j].waveVal*this.panePARAMS.ampFactor)*sin(o[j].degree+180);
                degree +=1
                vertex(o[j].x, o[j].y);
            }
            endShape();
            if(o[0].radius > this.panePARAMS.maxRadius){
                output.splice(i,1);
            }
        }

		fourier.analyze();
        var bass = fourier.getEnergy( "bass" );
        var mapBass = map( bass, 0, 255, 1, this.panePARAMS.scaleFactor);

        noStroke();
        fill(255);
        arc(startX, startY,
            this.panePARAMS.arcSize*mapBass,
            this.panePARAMS.arcSize*mapBass,
             0, 180);

		pop();
	};
}