function ThreeDSpaceRocket(){

    this.name = "ThreeDSpaceRocket";
    this.panePARAMS = {
        name: this.name,
        camera: {x: 0, y: -500, z: 20},
        camRotation: {x: 1.5308176374382183, y: 0, z: 0}
    }

    this.addPaneGui = function(pane) {
        paneFolder = pane.addFolder({
            title: this.panePARAMS.name,
        });

        paneFolder.addInput(this.panePARAMS, 'camera', {
            x: {min: -500, max: 500},
            y: {min: -2000, max: 2000},
            z: {min: 0, max: 500},
        });
        paneFolder.addInput(this.panePARAMS, 'camRotation', {
            x: {min: -Math.PI, max: Math.PI},
            y: {min: -Math.PI, max: Math.PI},
            z: {min: -Math.PI, max: Math.PI},
        });

    }

    this.removePaneGui = function(){
        paneFolder.dispose();
        // document.getElementById('threeJsCanvas').remove();
    }

    this.setup = function() {



    }



    var camera, scene, renderer;

    var polys, planes;

    var paused = false;
    var speed = 10;
    var horizon = 3000;

    var time = Date.now();

    var moveLeft = false;
    var moveRight = false;

    var velocity = 0;

    var self = this

    init();

    function init(){

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.domElement.id = 'threeJsCanvas';

        renderer.setSize( window.innerWidth, window.innerHeight );

        // document.body.appendChild(renderer.domElement);

        let p5Canvas = document.getElementsByClassName("p5Canvas")[0];
        p5Canvas.before(renderer.domElement);

        renderer.setClearColor(0x000000, 1.0);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, horizon);

        camera.position.x = self.panePARAMS.camera.x;
        camera.position.y = self.panePARAMS.camera.y;
        camera.position.z = self.panePARAMS.camera.z;

        camera.lookAt(new THREE.Vector3(0,0,0));

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2( renderer.getClearColor(), 0.0005 );

        addPlanes();

        addPolys();


        window.addEventListener( 'resize', onWindowResize, false );
        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('keyup', onKeyUp, false);
        window.addEventListener('touchstart', onTouchStart, false);
        window.addEventListener('touchend', onTouchEnd, false);
        window.addEventListener('mousedown', onTouchStart, false);
        window.addEventListener('mouseup', onTouchEnd, false);
        window.addEventListener('touchmove', onTouchEnd, false);
        window.addEventListener('deviceorientation', onOrientation, false);


    }

    function addPlanes(){

        planes = [];
        var planeSegments = 60;

        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(horizon, horizon, planeSegments, planeSegments),
            new THREE.MeshBasicMaterial({ color:0x00FF00, wireframe:true, transparent:true })
        );
        plane.position.z = -20;

        planes[0] = plane;

        planes[1] = plane.clone();
        planes[1].position.y = plane.position.y + horizon;

        planes[2] = plane.clone();
        planes[2].position.y = plane.position.y + horizon * 2;

        scene.add(planes[0]);
        scene.add(planes[1]);
        scene.add(planes[2]);

    }


    function addPolys(){

        polys = [];

        var darkMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.5 } );

        var cube = THREE.SceneUtils.createMultiMaterialObject(
            new THREE.CubeGeometry(30, 30, 30),
            [darkMaterial, new THREE.MeshBasicMaterial( { color: 0xCF0505, wireframe: true, wireframeLinewidth: 3} )]
        );

        var tetra = THREE.SceneUtils.createMultiMaterialObject(
            new THREE.TetrahedronGeometry( 15, 0),
            [darkMaterial, new THREE.MeshBasicMaterial( { color: 0xF6790B, wireframe: true, wireframeLinewidth: 3} )]
        );

        var octa = THREE.SceneUtils.createMultiMaterialObject(
            new THREE.OctahedronGeometry( 10, 0),
            [darkMaterial, new THREE.MeshBasicMaterial( { color: 0x17C2EA, wireframe: true, wireframeLinewidth: 3} )]
        );

        var totalPolys = 100;

        for(var i = 0; i < totalPolys; i++){
            var poly;
            if(i < (totalPolys * 0.6)){
                poly = octa.clone();
            } else if(i >= totalPolys * 0.6 && i < totalPolys * 0.9){
                poly = tetra.clone();
            } else {
                poly = cube.clone();
            }

            poly.position.set(Math.random() * horizon - horizon/2, Math.random() * horizon + horizon/2, 20);

            poly.spinX = (Math.random() * 20 - 10) / 1000;
            poly.spinY = (Math.random() * 4 - 2) /100;
            poly.modX = (Math.random() * 3 - 2)/10;
            poly.modY = (Math.random() * 10 - 5)/10;
            polys.push(poly);
            scene.add( poly );
        }


        // Cones

        for(var i = 0; i < 10; i++){

            poly = THREE.SceneUtils.createMultiMaterialObject(
                new THREE.CylinderGeometry( 0, 30, 100, 20, 4 ),
                [darkMaterial, new THREE.MeshBasicMaterial( { color: 0xCDF346, wireframe: true, wireframeLinewidth: 3} )]
            );

            poly.position.set(Math.random() * horizon - horizon/2, Math.random() * horizon + horizon/2, 20);

            poly.rotation.x = Math.PI /2;

            poly.spinX = 0;
            poly.spinY = 0;
            poly.modX = 0;
            poly.modY = 0;

            polys.push(poly);
            scene.add( poly );

        }

    }



    this.draw = function() {

            if (!paused) {

                for(var i = 0; i < polys.length; i++){
                    var poly = polys[i];
                    poly.rotation.x += poly.spinX;
                    poly.rotation.y += poly.spinY;
                    poly.position.x += poly.modX;
                    poly.position.y += - speed  - poly.modY;

                    if(poly.position.y < camera.position.y){
                        polys[i].position.x = Math.random() * horizon - horizon/2;
                        polys[i].position.y = horizon;
                    }

                }

                if(planes[0].position.y < - horizon ){
                    planes[0].position.y = planes[2].position.y + horizon;
                }

                if(planes[1].position.y < - horizon ){
                    planes[1].position.y = planes[0].position.y + horizon;
                }

                if(planes[2].position.y < - horizon ){
                    planes[2].position.y = planes[1].position.y + horizon;
                }

                planes[0].position.y +=- speed ;
                planes[1].position.y +=- speed ;
                planes[2].position.y +=- speed ;


            }

            moveCamera( Date.now() - time );

            render();

            time = Date.now();

    }



    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();

    }

    function render() {
        camera.position.x = self.panePARAMS.camera.x;
        camera.position.y = self.panePARAMS.camera.y;
        camera.position.z = self.panePARAMS.camera.z;

        camera.rotation.x = self.panePARAMS.camRotation.x
        camera.rotation.y = self.panePARAMS.camRotation.y
        camera.rotation.z = self.panePARAMS.camRotation.z

        renderer.render( scene, camera );
    }


    function moveCamera(delta) {

        delta *= 0.1;

        velocity += ( - velocity ) * 0.04 * delta;

        var multi = speed / 20;

        if ( moveLeft ) velocity -= multi * delta;
        if ( moveRight ) velocity += multi * delta;

        camera.translateX( velocity );

    }


    function onOrientation(event){
        /*
                    alpha = event.alpha
                    beta = event.beta;
                    gamma = event.gamma;

                    if( beta > 5){
                        moveRight = false;
                        moveLeft = true;
                    } else if(beta < -5){
                        moveLeft = false;
                        moveRight = true;
                    } else {
                        moveLeft = false;
                        moveRight = false;
                    }
        */
    }

    function onTouchStart(event){

        paused = true;

    }

    function onTouchEnd(event){

        paused = false;

    }


    function onKeyDown(event){

        switch ( event.keyCode ) {

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

        }

    }

    function onKeyUp(event){

        switch( event.keyCode ) {

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    }




}