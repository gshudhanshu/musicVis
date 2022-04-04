function ReactiveCircles() {
    this.name = "Reactive Circles";
    this.panePARAMS = {
        name: this.name,
        bins: 16 * 2 ** 8,
        smoothing: 0.8,
        color1: '#ffffff',
        color2: '#ffff00',
        color3: '#ff0000',
        color4: '#ff66ff',
        color5: '#333399',
        color6: '#0000ff',
        color7: '#33ccff',
        color8: '#00ff00',
        // particleThreshold: 230,
        ampThreshold: 1.2
    }

    //tweakpane GUI
    this.addPaneGui = function (pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });

        // paneFolder.addInput(this.panePARAMS, 'particleThreshold', {
        //     min: 1,
        //     max: 250,
        // });
        paneFolder.addInput(this.panePARAMS, 'ampThreshold', {
            min: 1,
            max: 250,
        });

        paneFolder.addInput(this.panePARAMS, 'color1');
        paneFolder.addInput(this.panePARAMS, 'color2');
        paneFolder.addInput(this.panePARAMS, 'color3');
        paneFolder.addInput(this.panePARAMS, 'color4');
        paneFolder.addInput(this.panePARAMS, 'color5');
        paneFolder.addInput(this.panePARAMS, 'color6');
        paneFolder.addInput(this.panePARAMS, 'color7');
        paneFolder.addInput(this.panePARAMS, 'color8');

    }

    //Remove tweakpane GUI
    this.removePaneGui = function(){
        paneFolder.dispose();
    }

    var colors = [this.panePARAMS.color1, this.panePARAMS.color2, this.panePARAMS.color3,
        this.panePARAMS.color4, this.panePARAMS.color5, this.panePARAMS.color6,
        this.panePARAMS.color7, this.panePARAMS.color8];

    var particles = []

    var fourier = new p5.FFT(this.panePARAMS.smoothing, this.panePARAMS.bins);

    // -- spectrum constrants --
    const low = 20;
    const high = 130;
    const bands = 110;
    const thresh = 200;

    // -- circle spectrum constrants --
    const minR = 150;
    const maxR = 270;
    const overR = 10;


    this.setup = function () {
        angleMode(DEGREES)
        imageMode(CENTER)
        rectMode(CENTER)
    }

    // Draw function similar to P5.js
    this.draw = function () {

        colors = [this.panePARAMS.color1, this.panePARAMS.color2, this.panePARAMS.color3,
            this.panePARAMS.color4, this.panePARAMS.color5, this.panePARAMS.color6,
            this.panePARAMS.color7, this.panePARAMS.color8];

        colorMode(RGB, 255);
        // angleMode(RADIANS);
        angleMode(DEGREES)

        fourier.analyze()
        const bassLevel = max(fourier.getEnergy(low, high) - 160, 0) / 200 + 1;


        push()
        translate(width/2, height/2)
        if(bassLevel>this.panePARAMS.ampThreshold) {
            rotate(random(-2, 2))
        }
        image(bgImg, 0, 0, width + 100, height + 100)
        pop()

        var alpha = map(bassLevel, 1, this.panePARAMS.ampThreshold, 100, 150)
        fill(20, alpha)
        noStroke()
        rect(0, 0, width, height)

        push()
        translate(width/2, height/2)

        stroke(255)     // stroke color of ring
        // stroke(220, 107, 255)
        strokeWeight(3)
        noFill()



        const spectrum = createSmoothSpectrumArr(fourier, low, high, bands, 9);
        // spectrum = floorSpectrum(spectrum, THRESH);
        // spectrum = moveAvg(spectrum, 3);

        // translate(width / 2, height / 2);

        strokeWeight(1);
        const th = 4;

        for(let c = colors.length-1; c >= 0; c--){
            stroke(colors[c]);
            fill(colors[c]);
            const colorSpec = moveAvg(floorSpectrum(spectrum, thresh - c * 3), 3);
            drawSpectrum(colorSpec, 255 - thresh + c * 3, minR * bassLevel, maxR * bassLevel + overR * 3);

        }

        // stroke("#0f0");
        // fill("#0f0");
        // const green = moveAvg(floorSpectrum(spectrum, thresh - th * 3), 3);
        // drawSpectrum(green, 255 - thresh + th * 3, minR * bassLevel, maxR * bassLevel + overR * 3);
        //
        // stroke("#00f");
        // fill("#00f");
        // const blue = moveAvg(floorSpectrum(spectrum, thresh - th * 2), 3);
        // drawSpectrum(blue, 255 - thresh + th * 2, minR * bassLevel, maxR * bassLevel + overR * 2);
        //
        // stroke("#f00");
        // fill("#f00");
        // const red = moveAvg(floorSpectrum(spectrum, thresh - th), 3);
        // drawSpectrum(red, 255 - thresh + th, minR * bassLevel, maxR * bassLevel + overR * 1);
        //
        // stroke("#fff");
        // fill("#fff");
        // const white = moveAvg(floorSpectrum(spectrum, thresh), 3);
        // drawSpectrum(white, 255 - thresh, minR * bassLevel, maxR * bassLevel );

        stroke("#fff");
        fill("#000");
        // noStroke()

        circle(0, 0, bassLevel*maxR*1.05);
        image(emblem, 0, 0, minR * bassLevel, minR * bassLevel);


        var p = new Particle()
        particles.push(p)

        for(var i = particles.length - 1; i >= 0; i--) {
            if(!particles[i].edges()) {
                particles[i].update(bassLevel > this.panePARAMS.ampThreshold)
                particles[i].show()
            } else {
                particles.splice(i, 1)
            }

        }
        pop()
    }


    // --- Create Spectrum ---
    function createSmoothSpectrumArr(fft, lowFreq, highFreq, bands, overwrapWinSize) {
        const spectrum = [];
        const freqStep = (highFreq - lowFreq) / bands;
        for (let i = 0; i < bands; i++) {
            spectrum.push(
                fft.getEnergy(lowFreq + i * freqStep, lowFreq + i * freqStep + freqStep * overwrapWinSize)
            );
        }
        return spectrum;
    }

    function floorSpectrum(spectrum, thresh) {
        return spectrum.map((v) => max(0, v - thresh));
    }

    function moveAvg(arr, winSize = 3) {
        const avgs = [];
        for (let i = winSize - 1; i < arr.length; i++) {
            const win = arr.slice(i - winSize, i);
            const avg = win.reduce((v1, v2) => v1 + v2, 0) / winSize;
            avgs.push(avg);
        }
        return avgs;
    }

// --- Draw Circle Spectrum ---
    function drawSpectrum(arr, maxEnergy, minR, maxR, transparentR = 0) {
        angleMode(DEGREES);
        beginShape();
        for (let i = arr.length - 1; i >= 0; i--) {
            const angle = map(i, arr.length - 1, 0, 0, 180);
            const r = map(arr[i], 0, maxEnergy, minR, maxR);
            const x = r * sin(angle);
            const y = r * cos(angle);
            transparentR ? vertex(x, y) : curveVertex(x, y);
        }
        for (let i = 0; i < arr.length; i++) {
            const angle = map(i, 0, arr.length - 1, 180, 360);
            const r = map(arr[i], 0, maxEnergy, minR, maxR);
            const x = r * sin(angle);
            const y = r * cos(angle);
            transparentR ? vertex(x, y) : curveVertex(x, y);
        }
        if (transparentR) {
            beginContour();
            drawCircle(transparentR, 100);
            endContour();
        }
        endShape(CLOSE);
    }

    function drawCircle(r, steps) {
        angleMode(DEGREES);
        for (let i = steps; i > 0; i--) {
            const angle = ((i % steps) / steps) * 360;
            const x = r * sin(angle);
            const y = r * cos(angle);
            vertex(x, y);
        }
    }



    //Class for creating small circle particles
    class Particle{
        constructor() {
            this.pos = p5.Vector.random2D().mult(250)
            this.vel = createVector(0,0)
            this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

            this.w = random(3, 5)
            this.color = [random(100,255), random(200,255), random(100,255)]
        }
        update(cond) {
            this.vel.add(this.acc)
            this.pos.add(this.vel)
            if(cond) {
                this.pos.add(this.vel)
                this.pos.add(this.vel)
                this.pos.add(this.vel)
            }
        }
        edges() {
            if(this.pos.x < -width/2 || this.pos.x > width/2 || this.pos.y < -height/2 || this.pos.y > height/2) {
                return true
            } else {
                return false
            }
        }
        show() {
            noStroke()
            fill(this.color)
            ellipse(this.pos.x, this.pos.y, this.w)
        }
    }


}