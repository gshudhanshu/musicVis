//Contructor function for circle-line Vis
function CircleLine(){
    this.name = "Circle Line";
    this.panePARAMS = {
        name: this.name,
        ellipseSize: 200,
        scale:1,
    }

    this.addPaneGui = function(pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });
        //   pane.title = this.panePARAMS.name;
    }

    this.removePaneGui = function(){
        paneFolder.dispose();
    }

    var noiseStep = 0.01;
    var prog = 0;
    var progThresh = 0.7;
    var seedThresh = 0.8;
    var ellipseSize

    var fourier = new p5.FFT();

    this.draw = function(){
        colorMode(HSB, 360,100,100)

        fourier.analyze();
        var bass = map(fourier.getEnergy("bass"),0,255,0,1*this.panePARAMS.scale);
        var treble = map(fourier.getEnergy("treble"),0,255,0,1*this.panePARAMS.scale);
        var dataColor = getHSBColor(bass);

        console.log(fourier.getEnergy("treble"))

        noStroke();
        fill(dataColor);
        ellipseSize = this.panePARAMS.ellipseSize * bass

        // ellipse(mouseX,mouseY,ellipseSize,ellipseSize);
        noiseLine(bass,treble)
    };

    function getHSBColor(d){
        this.dataHue = map(d,0,1,0,360);
        this.dataSaturation = map(d,0,1,0,100);
        this.dataBrightness = map(d,0,1,0,100);
        return color(this.dataHue,this.dataSaturation,this.dataBrightness);
    }

    function noiseLine(energy, energy2)
    {
        push();
        translate(width/2, height/2);
        stroke(0,255,0);
        strokeWeight(1);
        for(var i = 0; i < 100; i++)
        {
            var dataColor = getHSBColor(energy);
            fill(dataColor);
            var x = map(noise(i* noiseStep + prog),0,1,-250,250);
            var y = map(noise(i* noiseStep + prog + 1000),0,1,-250,250);

            ellipse(x,y,this.panePARAMS.ellipseSize,this.panePARAMS.ellipseSize);
        }

        if(energy > progThresh)
        {
            prog += 0.05;
        }

        if(energy2 > seedThresh)
        {
            noiseSeed();
        }

        pop();
    }


}