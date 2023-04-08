//Constructor function to handle the onscreen menu, keyboard and mouse
//controls
function ControlsAndInput() {
  this.menuDisplayed = true

  this.keyPressed = function (keycode) {
    console.log(keycode)
    if (keycode == 32) {
      this.menuDisplayed = !this.menuDisplayed
    }

    if (keycode > 48 && keycode < 54) {
      var visNumber = keycode - 49

      if (paneFolder) {
        vis.selectedVisual.removePaneGui(pane)
      }

      vis.selectVisual(vis.visuals[visNumber].name)
      vis.selectedVisual.addPaneGui(pane)
    }
  }

  //draws the playback button and potentially the menu
  this.draw = function () {
    push()
    fill('white')
    stroke('black')
    strokeWeight(2)
    textSize(34)

    //playback button
    // this.playbackButton.draw();
    //only draw the menu if menu displayed is set to true.
    if (this.menuDisplayed) {
      text('Select a visualisation:', 100, 30)
      this.menu()
    }
    pop()
  }

  this.menu = function () {
    //draw out menu items for each visualisation
    for (var i = 0; i < vis.visuals.length; i++) {
      var yLoc = 70 + i * 40
      text(i + 1 + ':  ' + vis.visuals[i].name, 100, yLoc)
    }
  }
}
