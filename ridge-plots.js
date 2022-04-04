//Constructor function for ridge-plots Vis
function RidgePlots() {
    this.name = "Ridge Plots";
    this.panePARAMS = {
        name: this.name,
        arcSize: 400,
        scaleFactor: 2.5,
        maxRadius: 500,
        speed: 0.9,
        lineGap: 40,
        smallScale: 5,
        bigScale: 50,
        ampFactor: 3
    }

    //tweakpane GUI
    this.addPaneGui = function () {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name
        });
        var arcShape = paneFolder.addFolder({
            title: 'Arc Shape'
        })
        var arcLines = paneFolder.addFolder({
            title: 'Arc Lines'
        })
        arcShape.addInput(this.panePARAMS, 'arcSize', {
            min: 200,
            max: 600,
        });
        arcShape.addInput(this.panePARAMS, 'scaleFactor', {
            min: 1,
            max: 5,
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

    //Remove tweakpane GUI
    this.removePaneGui = function () {
        paneFolder.dispose();
    }

    let startX = width / 2;
    let startY = height / 2
    let output = [];
    let fourier = new p5.FFT(0.4, 1024);
    let amplitude = new p5.Amplitude();

    //Function for adding waves
    this.addWave = function () {
        let w = fourier.waveform();
        let radius = this.panePARAMS.arcSize / 2;

        let outputWave = [];

        for (let i = 0; i < w.length; i++) {

            if (i % 20 === 0) {
                let degree = map(i, 0, w.length, 0, 180);
                let waveVal;

                if (i < 1024 * 0.05 || i > 1024 * 0.95) {
                    waveVal = map(w[i], -1, 1, -this.panePARAMS.smallScale, this.panePARAMS.smallScale);
                } else {
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

    this.setup = function () {}

    // Draw function similar to P5.js
    this.draw = function () {
        colorMode(RGB, 255);
        angleMode(DEGREES);
        push();

        background(0)
        noFill();
        stroke(255)
        strokeWeight(2)

        //Adding new wave values in outputWave Array
        if (frameCount % this.panePARAMS.lineGap === 0) {
            this.addWave();
        }

        //Generating Arc line from outputWave Array
        for (var i = 0; i < output.length; i++) {
            var o = output[i]
            var degree = 0
            beginShape();
            for (var j = 0; j < o.length; j++) {
                o[j].radius += this.panePARAMS.speed
                o[j].x = startX + (o[j].radius + o[j].waveVal * this.panePARAMS.ampFactor) * cos(o[j].degree + 180);
                o[j].y = startY + (o[j].radius + o[j].waveVal * this.panePARAMS.ampFactor) * sin(o[j].degree + 180);
                degree += 1
                vertex(o[j].x, o[j].y);
            }
            endShape();
            if (o[0].radius > this.panePARAMS.maxRadius) {
                output.splice(i, 1);
            }
        }

        // fourier.analyze();
        // var bass = fourier.getEnergy( "bass" );
        // var bass = new p5.Amplitude();
        var level = amplitude.getLevel();
        var mapLevel = map(level, 0, 1, 1, this.panePARAMS.scaleFactor);

        //Drawing and resizing the bottom semicircle
        noStroke();
        fill(255);
        arc(startX, startY,
            this.panePARAMS.arcSize * mapLevel,
            this.panePARAMS.arcSize * mapLevel,
            0, 180);

        pop();
    };
}
