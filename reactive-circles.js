function ReactiveCircles() {
    this.name = "Reactive Circles";
    this.panePARAMS = {
        name: this.name,
        bins: 1024,
        smoothing: 0.95,
        color1: '#FFFFFF',
        color2: '#FFFF00',
        color3: '#FF0000',
        color4: '#FF66FF',
        color5: '#333399',
        color6: '#0000FF',
        color7: '#33CCFF',
        color8: '#00FF00',
    }

    this.addPaneGui = function (pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });

    }

    this.removePaneGui = function () {
        paneFolder.dispose();
    }

    var waves = [];
    var colors = [this.panePARAMS.color1, this.panePARAMS.color2, this.panePARAMS.color3,
        this.panePARAMS.color4, this.panePARAMS.color5, this.panePARAMS.color6,
        this.panePARAMS.color7, this.panePARAMS.color8];
    var delays = [0, 1, 2, 3, 4, 5, 6, 7];
    var spectrumCount = 8;
    var exponents = [1, 1.12, 1.14, 1.30, 1.33, 1.36, 1.50, 1.52];
    var smoothMargins = [0, 2, 2, 3, 3, 3, 5, 5];
    var spectrumSlice = 359;

    // spectrum config
    this.smoothingPasses = 1;
    this.smoothingPoints = 3;
    this.spectrumHeightScalar = 0.4;
    this.glowRadius = 25;


    // emblem config
    this.minEmblemSize = 480;
    this.maxEmblemSize = 600;
    this.maxShakeIntensity = Math.PI / 3;
    this.maxShakeDisplacement = 8;
    this.minShakeScalar = 0.9;
    this.maxShakeScalar = 1.6;



    var fourier = new p5.FFT(this.panePARAMS.smoothing, this.panePARAMS.bins);

    this.setup = function () {

    }

    this.draw = function () {
        colorMode(RGB, 255);
        // angleMode(RADIANS);

        fourier.analyze()
        let amp = fourier.getEnergy(20, 200)

        push()
        if(amp>230) {
            rotate(random(-1, 1))
        }
        image(bgImg, 0, 0, width + 100, height + 100)
        pop()

        push();

        // if (waves.length < 3) {
        //     for (let i = 0; i < 3; i++) {
        //         waves.push(new WaveCircle(createVector(width / 2, height / 2),
        //             50, width * 0.2, width * 0.3,
        //             colors[i], 0.1 + i * 0.25, 0.95));
        //     }
        // }


        // var spectrum = fourier.analyze();
        var spectrum = fourier.waveform(64);
        spectrum = spectrum.map((num)=>{return num*256})

        // spectrum = spectrum.slice(0,64)
        // console.log(spectrum)
        // spectrum = spectrum.slice(0,spectrumSlice)


        // var bass = map(fourier.getEnergy(20, 200), 0, 255, 0, 1);
        // var bass = map(fourier.getEnergy("bass"),0,255,0,1);
        // var treble = map(fourier.getEnergy("treble"), 0, 255, 0, 1);

        // blendMode(BLEND);
        // background(255);
        // blendMode(MULTIPLY);



        for (let s = spectrumCount - 1; s >= 0; s--) {
            // let curSpectrum = this.smooth(
            //     spectrum[Math.max(spectrum.length - delays[s] - 1, 0)],
            //     smoothMargins[s]);
            let curRad = this.calcRadius(exponents[s]);

            let curSpectrum = spectrum;

            let points = [];

            let len = curSpectrum.length;
            for (let i = 0; i < len; i++) {
                t = PI * (i / (len - 1)) - HALF_PI;
                r = curRad + Math.pow(curSpectrum[i] * this.spectrumHeightScalar,
                    exponents[s]);
                x = r * Math.cos(t);
                y = r * Math.sin(t);
                points.push({x: x, y: y});
            }

            fill(colors[s]);
            this.drawPoints(points);
        }

        pop();
    }

    this.calcRadius = function(multiplier) {
        let minSize = this.minEmblemSize;
        let maxSize = this.maxEmblemSize;
        let scalar = multiplier * (maxSize - minSize) + minSize;
        let resMult = 1;

        if(width >= height) {resMult = width /1920} else {resMult = height / 1080}

        return resMult * scalar / 2;
    }

    this.drawPoints = function(points) {
        if (points.length == 0) {
            return;
        }

        let halfWidth = width / 2;
        let halfHeight = height / 2;

        beginShape();
        vertex(points[0].x + halfWidth, points[0].y + halfHeight);
        for (let neg = 0; neg <= 1; neg++) {
            let xMult = neg ? -1 : 1;

            // Canvas.context.moveTo(halfWidth, points[0].y + halfHeight);

            let len = points.length;
            for (let i = 1; i < len - 2; i++) {
                let c = xMult * (points[i].x + points[i + 1].x) / 2 + halfWidth;
                let d = (points[i].y + points[i + 1].y) / 2 + halfHeight;
                quadraticVertex(xMult * points[i].x + halfWidth, points[i].y + halfHeight, c, d);
            }
            quadraticVertex(xMult * points[len - 2].x + halfWidth + neg * 2,
                points[len - 2].y + halfHeight, xMult * points[len - 1].x + halfWidth,
                points[len - 1].y + halfHeight);
        }

        vertex(points[points.length-1].x + halfWidth, points[points.length-1].y + halfHeight);
        // vertex(points[points.length-1].x, points[points.length-1].y);
        endShape(CLOSE);
    }

    this.smooth = function(points, margin) {
        if (margin == 0) {
            return points;
        }

        let newArr = Array();
        for (let i = 0; i < points.length; i++) {
            let sum = 0;
            let denom = 0;
            for (let j = 0; j <= margin; j++) {
                if (i - j < 0 || i + j > points.length - 1) {
                    break;
                }
                sum += points[i - j] + points[i + j];
                denom += (margin - j + 1) * 2;
            }
            newArr[i] = sum / denom;
        }
        return newArr;
    }
}