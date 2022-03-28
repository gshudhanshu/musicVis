function ReactiveCircles() {
    this.name = "Reactive Circles";
    this.panePARAMS = {
        name: this.name,
        bins: 512,
        smoothing: 0.8,
        color1: '#ffffff',
        color2: '#ffff00',
        color3: '#ff0000',
        color4: '#ff66ff',
        color5: '#333399',
        color6: '#0000ff',
        color7: '#33ccff',
        color8: '#00ff00',
        particleThreshold: 190,
        ampThreshold: 190
    }

    this.addPaneGui = function (pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });

        paneFolder.addInput(this.panePARAMS, 'particleThreshold', {
            min: 100,
            max: 250,
        });
        paneFolder.addInput(this.panePARAMS, 'ampThreshold', {
            min: 100,
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

    this.removePaneGui = function(){
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

    var particles = []

    var fourier = new p5.FFT(this.panePARAMS.smoothing, this.panePARAMS.bins);

    this.setup = function () {
        angleMode(DEGREES)
        imageMode(CENTER)
        rectMode(CENTER)
    }

    this.draw = function () {

        colors = [this.panePARAMS.color1, this.panePARAMS.color2, this.panePARAMS.color3,
            this.panePARAMS.color4, this.panePARAMS.color5, this.panePARAMS.color6,
            this.panePARAMS.color7, this.panePARAMS.color8];

        colorMode(RGB, 255);
        // angleMode(RADIANS);
        angleMode(DEGREES)

        fourier.analyze()
        let amp = fourier.getEnergy(20, 200)

        push()
        translate(width/2, height/2)
        if(amp>this.panePARAMS.ampThreshold) {
            rotate(random(-2, 2))
        }
        image(bgImg, 0, 0, width + 100, height + 100)
        pop()

        var alpha = map(amp, 0, 255, 100, 150)
        fill(20, alpha)
        noStroke()
        rect(0, 0, width, height)

        push()
        translate(width/2, height/2)

        stroke(255)     // stroke color of ring
        // stroke(220, 107, 255)
        strokeWeight(3)
        noFill()

        var wave = fourier.waveform();
        let multi

        for(var w = colors.length-1; w >= 0; w--) {

            if(amp>this.panePARAMS.ampThreshold){
                multi = exponents[w]
            } else {
                multi = 1
            }

                for(var t = -1; t <= 1; t += 2) {
                fill(colors[w])
                    noStroke();
                beginShape()
                for(var i = 0; i <= 180; i += 0.5) {
                    var index = floor(map(i,0,180,0,wave.length-1))
                    var r = map(wave[index], -1, 1, 90, 350)*(multi);
                    var x = r * sin(i) * t
                    var y = r * cos(i)
                    vertex(x,y)
                }
                endShape();
                    push();
                    if(amp>190) {
                       rotate(random(5, 15))
                    } else {rotate(0)}

                        image(emblem, 0, 0, r, r);
                    pop();

            }
        }


        var p = new Particle()
        particles.push(p)

        for(var i = particles.length - 1; i >= 0; i--) {
            if(!particles[i].edges()) {
                particles[i].update(amp > this.panePARAMS.particleThreshold)
                particles[i].show()
            } else {
                particles.splice(i, 1)
            }

        }
        pop()
    }

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