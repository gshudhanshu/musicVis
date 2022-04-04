var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound;
var soundArr = [];
//variable for p5 fast fourier transform
var fourier, compressor;
var currentMusic = 0;

var pane, paneFolder;

//Instructions
var instructions = 0;

//All music sources included in report
var musicPlaylist = [
	{path: 'assets/music/stomper_reggae_bit.mp3',
		thumb: 'assets/music/thumb/thumb.jpg',
		title: 'Stomper Reggae Bit',
		composer: 'Unknown', length: '1:28'},
	{path: 'assets/music/Andromedik - Let Me In [NCS Release].mp3',
		thumb: 'assets/music/thumb/Andromedik - Let Me In [NCS Release].jpg',
		title: 'Let Me In [NCS Release]',
		composer: 'Andromedik', length: '3:48'},

	{path: 'assets/music/Andromedik - SHE [NCS Release].mp3',
		thumb: 'assets/music/thumb/Andromedik - SHE [NCS Release].jpg',
		title: 'SHE [NCS Release]',
		composer: 'Andromedik', length: '3:57'},

	{path: 'assets/music/Defqwop - Say The Word (feat. The Ruins) [NCS Release].mp3',
		thumb: 'assets/music/thumb/Defqwop - Say The Word (feat. The Ruins) [NCS Release].jpg',
		title: 'Say The Word (feat. The Ruins) [NCS Release]',
		composer: 'Defqwop', length: '3:05'},

	{path: 'assets/music/Different Heaven - Nekozilla (LFZ Remix) [NCS Release].mp3',
		thumb: 'assets/music/thumb/Different Heaven - Nekozilla (LFZ Remix) [NCS Release].jpg',
		title: 'Nekozilla (LFZ Remix) [NCS Release]',
		composer: 'Heaven', length: '3:05'},

	{path: 'assets/music/Jim Yosef - Firefly [NCS Release].mp3',
		thumb: 'assets/music/thumb/Jim Yosef - Firefly [NCS Release].jpg',
		title: 'Firefly [NCS Release]',
		composer: 'Jim Yosef', length: '4:35'},

	{path: 'assets/music/Jim Yosef & Anna Yvette - Courage [NCS Release].mp3',
		thumb: 'assets/music/thumb/Jim Yosef & Anna Yvette - Courage [NCS Release].jpg',
		title: 'Courage [NCS Release]',
		composer: 'Jim Yosef & Anna Yvette', length: '3:44'},

	{path: 'assets/music/Jim Yosef - Link.mp3',
		thumb: 'assets/music/thumb/Jim Yosef - Link.jpg',
		title: 'Link',
		composer: 'Jim Yosef', length: '3:44'},

	{path: 'assets/music/NIVIRO - The Return [NCS Release].mp3',
		thumb: 'assets/music/thumb/NIVIRO - The Return [NCS Release].jpg',
		title: 'The Return [NCS Release]',
		composer: 'NIVIRO', length: '3:23'},

	{path: 'assets/music/Tobu - Candyland.mp3',
		thumb: 'assets/music/thumb/Tobu - Candyland.jpg',
		title: 'Candyland',
		composer: 'Tobu', length: '3:20'},
]

//Loading all the required files before starting
function preload(){

	for(var i = 0; i<musicPlaylist.length; i++){
		soundArr.push(loadSound(musicPlaylist[i].path));
	}

	//Source: https://unsplash.com/photos/BKAaLmT0tIs
	bgImg = loadImage("https://images.unsplash.com/photo-1482686115713-0fbcaced6e28?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=747")
	//Source: https://commons.wikimedia.org/wiki/File:P5.js_icon.svg
	emblem = loadImage('./icons/P5.js_icon.svg');
	// Source: https://fonts.google.com/
	myFont = loadFont('/font/Oswald-Regular.ttf');

}

function setup(){
	createCanvas(windowWidth, windowHeight);
	// createCanvas(400, 400);
	 imageMode(CENTER);
	 background(0);
	 bgImg.filter(BLUR, 1)
	 textFont(myFont);
	 frameRate(60);

	//instantiate the fft object
	 fourier = new p5.FFT();

	 sound = soundArr[currentMusic];
	 controls = new ControlsAndInput();

	 //create a new visualisation container and add visualisations
	 vis = new Visualisations();
	 vis.add(new Spectrum());
	 vis.add(new RidgePlots());
	 vis.add(new CircleLine());
	 vis.add(new ReactiveCircles());
	 vis.add(new ThreeDSpaceRocket());

	//  DAT GUI
	pane = new Tweakpane.Pane();
	vis.selectedVisual.addPaneGui(pane);
	vis.selectedVisual.setup();

}

function draw(){
	background(0);

	//Showing instructions before start
	if(!instructions){
		push()
		fill(255);
		textSize(32);
		textAlign(CENTER, CENTER);
		translate(width/2, height/2);
		text('Viz menu can be accessed by <SPACE> bar', 10, 30);
		pop()

		setTimeout(function () {
			instructions = 1;
		}, 7000);

	}

	if(vis.selectedVisual.name === "3D Car & Cuboids"){
		document.getElementById('threeJsContainer').style.display = 'block';
	} else {
		document.getElementById('threeJsContainer').style.display = 'none';
	}

	//draw the selected visualisation
	vis.selectedVisual.draw();
	//draw the controls on top.
	controls.draw();

	playerGUI();

}

// function mouseClicked(){
// 	controls.mousePressed();
// }

function keyPressed(){
	controls.keyPressed(keyCode);
}

//when the window has been resized. Resize canvas to fit 
//if the visualisation needs to be resized call its onResize method
function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	if(vis.selectedVisual.hasOwnProperty('onResize')){
		vis.selectedVisual.onResize();
	}
}
