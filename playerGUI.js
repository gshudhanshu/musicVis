var timeline = document.querySelector('.timeline')
var progressbar = document.querySelector('.progressbar')
var trackTitle = document.querySelector('.player_row > .track_title')
var curTime = document.querySelector(".track_timer");

var playPauseSwitch = document.querySelector(".playPauseSwitch");
var playBtn = document.querySelector(".play");
var volumeBtn = document.querySelector(".volume");

var playlistExpander = document.querySelector(".playlist_expander");
var playlistDrawer = document.querySelector(".play_list_drawer");

var currentSec;
var duration;
var firstPlay = true;

//Event listeners
timeline.addEventListener("click", seekProgress.bind(this));
playPauseSwitch.addEventListener("click", togglePlay.bind(this));
volumeBtn.addEventListener("click", toggleVolume.bind(this));
playlistExpander.addEventListener("click", togglePlayList.bind(this));

// Handles the Graphical interface of the music player
function playerGUI(){
    currentSec = sound.currentTime();
    duration = sound.duration();
    setCurTimePos(currentSec,duration);

    if(!firstPlay && (duration-currentSec)<=0.1){
        nextMusic();
    }
}

function togglePlay(event) {
    playBtn = document.querySelector(".play");
    // checks for clicks on the button, starts or pauses playback.
    if (sound.isPlaying()) {
        sound.pause();
    } else {
        sound.play();
        firstPlay = false;
    }
    playBtn.classList.toggle("fa-play");
    playBtn.classList.toggle("fa-pause");
}

function toggleVolume(e) {
    var zero = document.querySelector(".volume_zero");
    var one = document.querySelector(".volume_one");
    var two = document.querySelector(".volume_two");
    var three = document.querySelector(".volume_three");
    var four = document.querySelector(".volume_four");
    var volArr = [zero,one,two,three,four];

    if(e.target !== zero && e.target !== one && e.target !== two &&
        e.target !== three && e.target !== four){
        return;
    }
    for(var i=0; i<volArr.length;i++){

        if(e.target == (volArr[i])){
            volArr[i].style.color = "white";
            sound.setVolume(i/4)
        } else{
            volArr[i].style.color = "lightslategray";
        }
    }
}

function nextMusic() {
    if (sound.isPlaying()) {
        sound.stop();
    }
    sound.stop();
    if(currentMusic < musicPlaylist.length-1){
        currentMusic++;
        sound = soundArr[currentMusic];
        sound.play();
    } else {
        currentMusic = 0;
        sound = soundArr[currentMusic];
        sound.play();
    }
    playBtn.classList.toggle("fa-pause");
    trackTitle.innerHTML = musicPlaylist[currentMusic].title;
}

function previousMusic() {
    sound.stop();
    if(0 < currentMusic){
        currentMusic--;
        sound = soundArr[currentMusic];
        sound.play();
    } else {
        currentMusic = musicPlaylist.length-1;
        sound = soundArr[currentMusic];
        sound.play();
    }
    playBtn.classList.toggle("fa-pause");
    trackTitle.innerHTML = musicPlaylist[currentMusic].title;
}

function setCurTimePos(currentSec,duration){
    var position = (currentSec/duration)*100
    if(position>0){
        progressbar.style.width = position+"%";
        curTime.innerHTML = secToMMSS(currentSec);
    }
}

//Get mouse location on progress bar.
// Set width of progress bar till that location and currentSec duration relative to it.
function seekProgress(e){
    var percent = e.offsetX / timeline.offsetWidth;
    sound.jump(percent * duration);
    progressbar.style.width = percent*100 + "%";
}

function togglePlayList(e){
    if (playlistDrawer.style.display == "none") {
        playlistDrawer.style.display = "block";
    } else {
        playlistDrawer.style.display = "none";
    }
    console.log("TEST");
}

//Helper functions
function secToMMSS(currentSecond){
    let min = Math.floor(currentSecond / 60);
    let sec = Math.floor(currentSecond % 60);
    if(min<10){min="0"+min}
    if(sec<10){sec="0"+sec}
    return (min+":"+sec);
}

//Constructor function for generating playlist html code from object
function CreateTrackItem(){
}