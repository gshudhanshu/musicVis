//global for the controls and input 
var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound, sound0, sound1, sound2, sound3,sound4;
var soundArr = [];
//variable for p5 fast fourier transform
var fourier;
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
}

function setup(){
	 createCanvas(windowWidth, windowHeight);
	 background(0);

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
