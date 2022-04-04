//Contructor function for 3D Car & Cuboids Vis
//Importing modules
import * as THREE from 'three';
import {OrbitControls} from './lib/OrbitControls.js';
import {GLTFLoader} from './lib/GLTFLoader.js';
import {DRACOLoader} from './lib/DRACOLoader.js';
import {RGBELoader} from './lib/RGBELoader.js';

function ThreeDSpaceRocket(){

    this.name = "3D Car & Cuboids";
    this.panePARAMS = {
        name: this.name,
        carColor: 0xff0000,
        lowAmpColor: {r: 0, g:215, b: 255},
        highAmpColor: {r: 255, g:50, b: 200},
        scaleFactor: 2.0,
        speed: 10
    }

    //tweakpane GUI
    this.addPaneGui = function(pane) {
        paneFolder = pane.addFolder({ title: this.panePARAMS.name, });
        const car = paneFolder.addFolder({title: 'Car'});
        const cuboids = paneFolder.addFolder({title: 'Cuboids'});

        car.addInput(this.panePARAMS, 'carColor', {
            view: 'color',
        });

        cuboids.addInput(this.panePARAMS, 'lowAmpColor', {
            view: 'color',
        });
        cuboids.addInput(this.panePARAMS, 'highAmpColor', {
            view: 'color',
        });
        cuboids.addInput(this.panePARAMS, 'scaleFactor', {
            min: 1,
            max: 7,
            step: 0.25
        });
        cuboids.addInput(this.panePARAMS, 'speed', {
            min: 1,
            max: 20,
            step: 1
        });
    }

    //Remove tweakpane GUI
    this.removePaneGui = function(){
        paneFolder.dispose();
    }


    this.setup = function() {
    }

    var self = this

    var camera, scene, renderer;

    var planes ,carModel;

    var stats, controls;
    const wheels = [];

    var paused = false;
    var horizon = 3000;

    var time = Date.now();

    var moveLeft = false;
    var moveRight = false;
    var moveUp = false;
    var moveDown = false;

    var velocityLR = 0;
    var velocityUD = 0;

    var fourier = new p5.FFT();
    let amplitude = new p5.Amplitude(0.8);


    init();

    //Initialization function
    function init(){

        //html container for threejs Canvas
        const container = document.getElementById( 'threeJsContainer' );

        //Setting up the Canvas in HTML
        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.id = 'threeJsCanvas';
        container.appendChild( renderer.domElement );

        renderer.setClearColor(0x000000, 1.0);

        //camera settings
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, horizon);
        camera.position.y = -700;
        camera.position.z = 200;
        camera.lookAt(new THREE.Vector3(0,0,0));

        //3d mouse controls settings
        controls = new OrbitControls( camera, container );
        // controls.enableDamping = true;
        // controls.maxDistance = 9;
        // controls.target.set( 0, 0.5, 0 );
        controls.update();

        //scene settings
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
        scene.background = new THREE.Color( 0x333333 );
        scene.environment = new RGBELoader().load( './assets/textures/venice_sunset_1k.hdr' );
        scene.environment.mapping = THREE.EquirectangularReflectionMapping;

        //light settings
        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( -5, -10, 8 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        scene.add( dirLight );

        //adding plane and cuboids on canvas
        addPlanes();
        cuboids();

        //materials settings
        const bodyMaterial = new THREE.MeshPhysicalMaterial( {
            color: self.panePARAMS.carColor,
            metalness: 1.0,
            roughness: 0.5,
            reflectivity: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            sheen: 0.5,
        } );

        const detailsMaterial = new THREE.MeshStandardMaterial( {
            color: 0xffffff, metalness: 1.0, roughness: 0.5, reflectivity: 0.5,
        } );

        const glassMaterial = new THREE.MeshPhysicalMaterial( {
            color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0, clearcoat: 0.4, reflectivity: 1
        } );

        // Ferrari Car
        // Used 3D car template
        // source: https://threejs.org/examples/?q=car#webgl_materials_car

        //3d car setting
        const shadow = new THREE.TextureLoader().load( 'assets/models/ferrari_ao.png' );
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'lib/draco/gltf/' );

        const loader = new GLTFLoader();
        loader.setDRACOLoader( dracoLoader );

        loader.load( 'assets/models/ferrari.glb', function ( gltf ) {

            carModel = gltf.scene.children[ 0 ];

            carModel.scale.set(30,30,30)

            carModel.getObjectByName( 'body' ).material = bodyMaterial;

            carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
            carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
            carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
            carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
            carModel.getObjectByName( 'trim' ).material = detailsMaterial;

            carModel.getObjectByName( 'glass' ).material = glassMaterial;

            wheels.push(
                carModel.getObjectByName( 'wheel_fl' ),
                carModel.getObjectByName( 'wheel_fr' ),
                carModel.getObjectByName( 'wheel_rl' ),
                carModel.getObjectByName( 'wheel_rr' )
            );

            // car shadow
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
                new THREE.MeshBasicMaterial( {
                    map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
                } )
            );
            mesh.rotation.x = - Math.PI / 2;
            mesh.renderOrder = 2;

            carModel.add( mesh );

            carModel.rotation.x = Math.PI/2;
            scene.add( carModel );

        } );


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

    //Adding planes
    function addPlanes(){

        planes = [];
        var planeSegments = 60;

        var material = new THREE.MeshLambertMaterial({color:0xff0000,opacity:0.2,transparent:true,overdraw:0.5});
        const plane = new THREE.GridHelper( horizon, planeSegments, 0x00FF00, 0x00FF00 );

        plane.position.z = 0;
        plane.rotation.x = - Math.PI / 2;

        planes[0] = plane;

        planes[1] = plane.clone();
        planes[1].position.y = plane.position.y + horizon;

        planes[2] = plane.clone();
        planes[2].position.y = plane.position.y + horizon * 2;

        scene.add(planes[0]);
        scene.add(planes[1]);
        scene.add(planes[2]);
    }

    // Adding cuboids
    var cubesLeft, cubesRight;
    var cubeSize;
    function cuboids(){

        //Cube material
        const material = new THREE.MeshStandardMaterial()
        material.color.setRGB(
            self.panePARAMS.lowAmpColor.r/255,
            self.panePARAMS.lowAmpColor.g/255,
            self.panePARAMS.lowAmpColor.b/255
        );

        cubeSize =  40;
        const boxGeometry = new THREE.BoxGeometry(cubeSize,cubeSize,5)
        boxGeometry.translate(0,0,2.5)

        //total cubes tobe added on canvas
        var totalcubes = 300;
        cubesRight = [];
        cubesLeft = [];

        //Adding the cues to canvas
        //Right side cubes
        const cube = new THREE.Mesh(boxGeometry, material)
        cube.position.set(150, 0, 0);
        for(let i = 0; i < totalcubes; i++){
            cubesRight[i] = cube.clone();
                cubesRight[i].position.x = 150;

            cubesRight[i].position.y = cube.position.y + cubeSize*i;
            scene.add( cubesRight[i] );
        }

        //Left side cubes
        cube.position.set(-150, 0, 0);
        for(let i = 0; i < totalcubes; i++){
            cubesLeft[i] = cube.clone();
                cubesLeft[i].position.x = -150;
            cubesLeft[i].position.y = cube.position.y + cubeSize*i;
            scene.add( cubesLeft[i] );
        }
    }

    //Draw function similar to p5js
    this.draw = function() {
        fourier.analyze()
        let amp = amplitude.getLevel()*255*self.panePARAMS.scaleFactor;

        if (!paused) {
            //updating the car color
            carModel.getObjectByName( 'body' ).material.color = new THREE.Color( self.panePARAMS.carColor )


            for(var i = 0; i < cubesRight.length; i++){
                var cubeR = cubesRight[i];
                var cubeL = cubesLeft[i];

                //If the cube's y-coordinate is -800 from the car the cube will be moved to top of the cubes row
                if(cubeR.position.y <= -800 ){
                    //Resetting the color changed from amp
                    let newMat = cubeR.material.clone();
                    newMat.color.setRGB(self.panePARAMS.lowAmpColor.r/255,
                        self.panePARAMS.lowAmpColor.g/255,
                        self.panePARAMS.lowAmpColor.b/255);
                    cubeR.material = newMat;
                    cubeL.material = newMat;

                    //Resetting the dimensions of the cube
                    if(i === 0 ){
                        cubeR.position.y = cubesRight[cubesRight.length-1].position.y + cubeSize;
                        cubeL.position.y = cubesLeft[cubesLeft.length-1].position.y + cubeSize;
                        cubeR.scale.z =  1;
                        cubeL.scale.z =  1;
                    } else {
                        cubeR.position.y = cubesRight[i-1].position.y + cubeSize;
                        cubeR.scale.z = 1;
                        cubeL.position.y = cubesLeft[i-1].position.y + cubeSize;
                        cubeL.scale.z = 1;
                    }
                }

                // moving the cube backwards
                cubeR.position.y +=- self.panePARAMS.speed ;
                cubeL.position.y +=- self.panePARAMS.speed ;

                //fade the colour of the bin (lowAmpColor, highAmpColor)
                let r = map(amp, 0, 255, self.panePARAMS.lowAmpColor.r, self.panePARAMS.highAmpColor.r)/255;
                let g = map(amp, 0, 255, self.panePARAMS.lowAmpColor.g, self.panePARAMS.highAmpColor.g)/255;
                let b = map(amp, 0, 255, self.panePARAMS.lowAmpColor.b, self.panePARAMS.highAmpColor.b)/255;

                if(cubeR.position.y <= cubeSize && cubeR.position.y >= -cubeSize && amp > 0){
                    cubeR.scale.z = amp * 0.060 + 1

                    //Changing color as per amp
                    var newMat = cubeR.material.clone();
                    newMat.color.setRGB(r,g,b);
                    cubeR.material = newMat;
                }

                if(cubeL.position.y <= cubeSize && cubeL.position.y >= -cubeSize && amp > 0){
                    cubeL.scale.z = amp*0.060 + 1;

                    //Changing color as per amp
                    var newMat = cubeR.material.clone();
                    newMat.color.setRGB(r,g,b);
                    cubeL.material = newMat;
                }
            }

            // If the plane y-coordinate of plane less than -horizon then it will be shifted to top of the planes row
            if(planes[0].position.y < - horizon ){
                planes[0].position.y = planes[2].position.y + horizon;
            }

            if(planes[1].position.y < - horizon ){
                planes[1].position.y = planes[0].position.y + horizon;
            }

            if(planes[2].position.y < - horizon ){
                planes[2].position.y = planes[1].position.y + horizon;
            }

            // moving the plane backwards
            planes[0].position.y +=- self.panePARAMS.speed ;
            planes[1].position.y +=- self.panePARAMS.speed ;
            planes[2].position.y +=- self.panePARAMS.speed ;

        }

        //Moving the camera using arrow keys
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

        const time = - performance.now() / 1000;
        for ( let i = 0; i < wheels.length; i ++ ) {
            wheels[ i ].rotation.x = self.panePARAMS.speed * time * Math.PI * 2;
        }

        controls.update();
        renderer.render( scene, camera );
    }

    //function for moving camera as per arrow keys
    function moveCamera(delta) {
        delta *= 0.1;

        velocityLR += ( - velocityLR ) * 0.04 * delta;
        velocityUD += ( - velocityUD ) * 0.04 * delta;

        var multi = self.panePARAMS.speed / 20;

        if ( moveLeft ) velocityLR -= multi * delta;
        if ( moveRight ) velocityLR += multi * delta;

        if ( moveUp ) velocityUD -= multi * delta;
        if ( moveDown ) velocityUD += multi * delta;

        camera.translateX( velocityLR );
        camera.translateY( velocityUD );

    }


    function onOrientation(event){
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
                moveLeft = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 38: // up
            case 87: // w
                moveUp = true;
                break;

            case 40: // down
            case 83: // s
                moveDown = true;
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

            case 38: // up
            case 87: // w
                moveUp = false;
                break;

            case 40: // down
            case 83: // s
                moveDown = false;
                break;

        }

    }

}

//Setting global function from the module.
window.ThreeDSpaceRocket = ThreeDSpaceRocket;
