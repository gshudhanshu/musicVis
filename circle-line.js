//Contructor function for circle-line Vis
function CircleLine() {
    this.name = "Circle Line";
    this.panePARAMS = {
        name: this.name,
        ellipseSize: 200,
        lineLength: 100,
        moveThresh: 0.7,
        scale: 1,
        particleSize: 10,
    }

    //tweakpane GUI
    this.addPaneGui = function (pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });

        paneFolder.addInput(this.panePARAMS, 'ellipseSize', {
            min: 50,
            max: 400,
            step: 50
        });
        paneFolder.addInput(this.panePARAMS, 'lineLength', {
            min: 5,
            max: 400,
            step: 5
        });
        paneFolder.addInput(this.panePARAMS, 'moveThresh', {
            min: 0.1,
            max: 1,
            step: 0.01
        });

        paneFolder.addInput(this.panePARAMS, 'particleSize', {
            min: 5,
            max: 25,
            step: 1
        });
    }

    //Remove tweakpane GUI
    this.removePaneGui = function () {
        paneFolder.dispose();
    }

    var noiseStep = 0.01;
    var prog = 0;
    var particles = [];
    var x, y;
    var fourier = new p5.FFT();
    var amplitude = new p5.Amplitude();
    var self = this;

    this.setup = function () {}

    // Draw function similar to P5.js
    this.draw = function () {
        colorMode(HSB, 360, 100, 100)

        var spectrum = fourier.analyze();
        var level = map(amplitude.getLevel(), 0, 1, 0.1, 1 * this.panePARAMS.scale);
        var bass = map(fourier.getEnergy("bass"), 0, 255, 0, 1 * this.panePARAMS.scale);
        var treble = map(fourier.getEnergy("treble"), 0, 255, 0, 1 * this.panePARAMS.scale);
        var dataColor = getHSBColor(bass);

        noStroke();
        fill(dataColor);
        ellipseSize = this.panePARAMS.ellipseSize * level

        noiseLine(bass, treble, ellipseSize);

        //Particles
        var size = map(level, 0, 1, 0, 200);
        particles.push(new Particle(color(dataColor)));
        for (var i = 0; i < particles.length; i++) {
            //Creating a variable to use so that if there are more particles than the samples(1024)
            /* spectrum will not have an array index out of bounds error */
            var freqId = i % 1024;
            //Created a variable that will use the frequency as the particle's speed
            var spec = map(spectrum[freqId], 0, 255, 0, 0.01);
            particles[i].display();
            particles[i].speedFactor = spec;
            particles[i].update();
            //If the distance from the position of the particle to it's target destination is less than the size of the amplitude
            if (dist(particles[i].pos.x, particles[i].pos.y,
                particles[i].targetPos.x, particles[i].targetPos.y) < size) {
                //Destroy the particle
                /*Used for visual and optimisation purposes*/
                particles.splice(i, 1);
            }

        }
    }

    function getHSBColor(d) {
        this.dataHue = map(d, 0, 1, 0, 360);
        this.dataSaturation = map(d, 0, 1, 0, 100);
        this.dataBrightness = map(d, 0, 1, 0, 100);
        return color(this.dataHue, this.dataSaturation, this.dataBrightness);
    }

    function noiseLine(energy, energy2, size) {
        push();
        translate(width / 2, height / 2);
        stroke(0, 255, 0);
        strokeWeight(1);
        for (var i = 0; i < self.panePARAMS.lineLength; i++) {
            var dataColor = getHSBColor(energy);
            fill(dataColor);
            x = map(noise(i * noiseStep + prog), 0, 1, -250, 250);
            y = map(noise(i * noiseStep + prog + 1000), 0, 1, -250, 250);

            ellipse(x, y, size, size);
        }

        if (energy > self.panePARAMS.moveThresh) {
            prog += 0.05;
        }

        pop();
    }

    //Particle class
    //col - colour of the particle
    function Particle(col) {

        //Initialising where the particle will spawn when the particle is created
        //Returns a vector that is on one of the four edges of the screen
        this.init = function () {
            var rand = floor(random(0, 4));
            var vec;
            if (rand == 0) {
                //Top
                vec = createVector(random(width), 0);
            } else if (rand == 1) {
                //Bottom
                vec = createVector(random(width), height);
            } else if (rand == 2) {
                //Left
                vec = createVector(0, random(height));
            } else {
                //Right
                vec = createVector(width, random(height));
            }
            return vec;
        }

        /*Variables are called after the init() function as it causes an error for the pos variable*/
        this.pos = this.init();
        this.targetPos = createVector(width / 2, height / 2);
        /*Will be the colour of the frequency when the particle is created */
        this.col = col;
        this.speedFactor;

        //Updates the position of the particle as well as the targetPosition
        this.update = function () {
            //Easing formula - as the particle moves closer to the target, slow down the speed of the particle
            this.pos.x += (this.targetPos.x - this.pos.x) * this.speedFactor;
            this.pos.y += (this.targetPos.y - this.pos.y) * this.speedFactor;
            //targetPos = mouse position
            this.targetPos.x = width / 2 + x;
            this.targetPos.y = height / 2 + y;
        }

        //Display the particle
        this.display = function () {
            fill(this.col);
            noStroke();
            ellipse(this.pos.x, this.pos.y, self.panePARAMS.particleSize);
        }

    }
}
