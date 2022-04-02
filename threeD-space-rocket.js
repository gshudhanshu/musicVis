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
        highAmpColor: {r: 255, g:50, b: 200}
    }

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
    }

    this.removePaneGui = function(){
        paneFolder.dispose();
    }

    this.setup = function() {
    }

    var self = this

    var camera, scene, renderer;

    var polys, planes;

    var carModel;

    var stats, controls;
    const wheels = [];

    var paused = false;
    var speed = 10;
    var horizon = 3000;

    var time = Date.now();

    var moveLeft = false;
    var moveRight = false;

    var velocity = 0;

    var fourier = new p5.FFT();


    init();


    function init(){

        const container = document.getElementById( 'threeJsContainer' );

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.id = 'threeJsCanvas';

        container.appendChild( renderer.domElement );

        renderer.setClearColor(0x000000, 1.0);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, horizon);

        camera.position.y = -500;
        camera.position.z = 100;

        camera.lookAt(new THREE.Vector3(0,0,0));

        controls = new OrbitControls( camera, container );
        // controls.enableDamping = true;
        // controls.maxDistance = 9;
        // controls.target.set( 0, 0.5, 0 );
        controls.update();

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );

        scene.background = new THREE.Color( 0x333333 );
        scene.environment = new RGBELoader().load( './assets/textures/venice_sunset_1k.hdr' );
        scene.environment.mapping = THREE.EquirectangularReflectionMapping;

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

        addPlanes();
        cuboids();

        //Materials
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
        // https://threejs.org/examples/?q=car#webgl_materials_car

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

            // // Add lights to the car
            // const headlights = new THREE.SpotLight(0xffffcc, 1);
            // headlights.position.set(0, 0, 1);
            // headlights.target.position.set(0, 0, 2);
            //
            // carModel.add(headlights);
            // carModel.add(headlights.target); // See docs https://threejs.org/docs/#api/en/lights/SpotLight.target



            // shadow
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

        // var plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(horizon, horizon, planeSegments, planeSegments),
        //     // new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 ),
        //     new THREE.MeshLambertMaterial({ color:0x00FFFF, wireframe:true, transparent:false })
        // );

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
    var cubesLeft, cubesRight, cube;
    var cubeSize;
    function cuboids(){

        const material = new THREE.MeshStandardMaterial()
        material.color.setRGB(
            self.panePARAMS.lowAmpColor.r/255,
            self.panePARAMS.lowAmpColor.g/255,
            self.panePARAMS.lowAmpColor.b/255
        );

        cubeSize =  40;
        const boxGeometry = new THREE.BoxGeometry(cubeSize,cubeSize,5)

        var totalcubes = 300;
        cubesRight = [];
        cubesLeft = [];


        const cube = new THREE.Mesh(boxGeometry, material)
        cube.position.set(150, 0, 0);
        boxGeometry.translate(0,0,2.5)

        for(let i = 0; i < totalcubes; i++){
            cubesRight[i] = cube.clone();
                cubesRight[i].position.x = 150;

            cubesRight[i].position.y = cube.position.y + cubeSize*i;
            scene.add( cubesRight[i] );
        }

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
        // let amp = fourier.getEnergy(20, 140);
        // if(amp >= 240) {amp += amp*1.5-amp}
        let amp1 = fourier.getEnergy("bass");
        // if(amp1 >= 252) {amp1 = amp1*1.15}
        let amp2 = fourier.getEnergy("lowMid");
        let amp3 = fourier.getEnergy("highMid");
        let amp4 = fourier.getEnergy("treble");
        let amp = (amp1*2 + amp4 - amp2 - amp3)*0.75

        if(amp < 0){amp = 0}

        if (!paused) {

            carModel.getObjectByName( 'body' ).material.color = new THREE.Color( self.panePARAMS.carColor )

            // carModel.getObjectByName( 'body' ).material.color = self.panePARAMS.carColor;

            for(var i = 0; i < cubesRight.length; i++){
                var cubeR = cubesRight[i];
                var cubeL = cubesLeft[i];

                if(cubeR.position.y <= -800 ){

                    //Resetting the color changed from amp
                    let newMat = cubeR.material.clone();
                    newMat.color.setRGB(self.panePARAMS.lowAmpColor.r/255,
                        self.panePARAMS.lowAmpColor.g/255,
                        self.panePARAMS.lowAmpColor.b/255);
                    cubeR.material = newMat;
                    cubeL.material = newMat;

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
                cubeR.position.y +=- speed ;
                cubeL.position.y +=- speed ;

                //fade the colour of the bin from green to red
                let r = map(amp1, 0, 255, self.panePARAMS.lowAmpColor.r, self.panePARAMS.highAmpColor.r)/255;
                let g = map(amp1, 0, 255, self.panePARAMS.lowAmpColor.g, self.panePARAMS.highAmpColor.g)/255;
                let b = map(amp1, 0, 255, self.panePARAMS.lowAmpColor.b, self.panePARAMS.highAmpColor.b)/255;

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

        const time = - performance.now() / 1000;
        for ( let i = 0; i < wheels.length; i ++ ) {
            wheels[ i ].rotation.x = speed * time * Math.PI * 2;
        }

        controls.update();
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

//Setting global function from the module.
window.ThreeDSpaceRocket = ThreeDSpaceRocket;
