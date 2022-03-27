//global for the controls and input 
var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound, sound0, sound1, sound2, sound3,sound4;
var soundArr = [];
//variable for p5 fast fourier transform
var fourier, compressor;
var currentMusic = 0;

var pane, paneFolder;

var musicPlaylist = [
	{path: 'assets/stomper_reggae_bit.mp3',
		thumb: 'assets/thumb/thumb.jpg',
		title: 'Stomper Reggae Bit',
		composer: 'comp1', length: '1:28'},
	{path: 'assets/Christmas Magic - AShamaluevMusic.mp3',
		thumb: 'assets/thumb/thumb.jpg',
		title: 'Christmas Magic',
		composer: 'comp1', length: '3:41'},
	{path: 'assets/Jo Bheji Thi Dua Remix 2022 - DJ Shadow Dubai(DJSathi).mp3',
		thumb: 'assets/thumb/thumb.jpg',
		title: 'Jo Bheji Thi Dua Remix 2022',
		composer: 'comp1', length: '3:41'},
	{path: 'assets/Unconditional Breakup Mashup 2022 - Aftermorning(DJSathi).mp3',
		thumb: 'assets/thumb/thumb.jpg',
		title: 'Unconditional Breakup Mashup 2022',
		composer: 'comp1', length: '3:41'}	
]



function preload(){

	for(var i = 0; i<musicPlaylist.length; i++){
		soundArr.push(loadSound(musicPlaylist[i].path));
	}
	bgImg = loadImage("https://images.unsplash.com/photo-1482686115713-0fbcaced6e28?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=747")
	emblem = loadImage('./icons/P5.js_icon.svg');
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

	//draw the selected visualisation
	vis.selectedVisual.draw();
	//draw the controls on top.
	controls.draw();

	playerGUI();

}

function mouseClicked(){
	// controls.mousePressed();
}

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
