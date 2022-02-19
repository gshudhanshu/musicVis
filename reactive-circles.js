function ReactiveCircles(){
    this.name = "Reactive Circles";
    this.panePARAMS = {
        name: this.name,
        pColor: 'FFFF00',
        sColor: 'FF00FF',
        tColor: '00FFFD'
    }

    this.addPaneGui = function(pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });

    }

    this.removePaneGui = function(){
        paneFolder.dispose();
    }

    let t = [];
    let COLS = [this.panePARAMS.pColor, this.panePARAMS.sColor,this.panePARAMS.tColor]


    this.setup = function() {
        for(let i = 0; i < 3; i++){
            t.push(new WaveCircle(createVector(width /2, height /2), 50, width * 0.2, width * 0.3, COLS[i], 0.1 + i * 0.25, 0.95));
        }
    }

    this.draw = function(){
        colorMode(RGB, 255);
        push();

        var  spectrum = fourier.analyze(this.panePARAMS.bins);




        blendMode(BLEND);
        background(255);
        blendMode(MULTIPLY);
        for(const i of t){
            i.drawWave();
            i.updateWave();
        }

        if(mouseIsPressed){
            for(const i of t){
                const d = dist(i.center.x, i.center.y, mouseX, mouseY);
                const v = map(d, 0, i.radius * 1.5, -i.radius / 4, -1, true);
                i.addVel(createVector(mouseX, mouseY),v);
            }
        }

        pop();
    }


    class WaveCircle
    {
        constructor(centerPos, vetrNum, radius, waveHeight, col, k = 0.95, atten = 0.95)
        {
            this.center = centerPos;
            this.waveH = [];
            this.vel = [];
            this.vNum = vetrNum;
            this.k = k;//波が伝播のベロシティ係数
            this.atten = atten;//減衰率
            this.radius = radius;
            this.maxWaveH = waveHeight;
            this.col = col;

            for(var i=0;i< this.vNum;i++)
            {
                this.waveH[i] = 0;
                this.vel[i] = 0;
            }
        }

        drawWave()
        {
            const baseRadius = this.radius;
            const vertNum = this.vNum;
            const rStep = TAU / vertNum;
            const centerPos = this.center;

            noStroke();
            fill(this.col);
            push();
            translate(centerPos);
            beginShape();

            for(let i = 0; i <= vertNum + 2; i ++)
            {
                let r = i * rStep;
                let radius = baseRadius + this.waveH[i % vertNum] ;
                let x = cos(r) * radius;
                let y = sin(r) * radius;
                curveVertex(x, y);
            }
            endShape();
            pop();
        }

        updateWave() {
            const maxHeight = this.maxWaveH;
            const num = this.vNum;
            const waveH = this.waveH;
            const vel = this.vel;

            //ベロシティの算出
            for (let i = 0; i < num; i++) {
                const prev = i == 0 ? num -1 : i - 1;
                const next = i == num -1 ? 0 : i + 1;
                var accel = waveH[prev] -  waveH[i] + waveH[next] - waveH[i];//両隣の座標との座標の差の和
                accel *= this.k;//加速度
                vel[i] = (vel[i] + accel) * this.atten;//速度
                vel[i] -= waveH[i]/30;
            }
            //ベロシティの適用
            for (let i = 0; i < num; i++) {
                waveH[i] += vel[i];
                if(waveH[i] > maxHeight) {//クランプ
                    waveH[i] = maxHeight;
                }
            }
        }

        addVel(pos, vel)
        {
            let angle = atan2(pos.y - this.center.y, pos.x - this.center.x);
            angle = angle < 0 ? angle + TAU : angle;
            let i = int(map(angle, 0, TAU, 0, this.vel.length));
            this.vel[i] += vel;
        }
    }


}