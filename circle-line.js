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
        colorMode(RGB, 255);
    }

    this.draw = function(){
        push();
        // var spectrum = fourier.analyze(this.bins);
        // var spectrum = fourier.smooth(0.8);
        colorMode(HSB, 360,100,100)

        var  spectrum = fourier.analyze();
        var bass = map(fourier.getEnergy('bass'),0,255,0,1*this.panePARAMS.scale);
        var dataColor = getHSBColor(bass);

        noStroke();
        fill(dataColor);
        var ellipseSize = this.panePARAMS.ellipseSize * bass
        ellipse(mouseX,mouseY,ellipseSize,ellipseSize);

        pop();
    };

    function getHSBColor(d){
        this.dataHue = map(d,0,1,0,360);
        this.dataSaturation = map(d,0,1,0,100);
        this.dataBrightness = map(d,0,1,0,100);
        return color(this.dataHue,this.dataSaturation,this.dataBrightness);
    }
}