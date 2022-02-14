
// gui params
var numShapes = 20;
var strokeWidth = 4;
var strokeColor = '#00ddff';
var fillColor = [180, 255, 255];
var drawStroke = true;
var	drawFill = true;
var radius = 20;
var shape = ['circle', 'triangle', 'square', 'pentagon', 'star'];
var label = 'label';

// gui
var visible = true;
var gui;

//Contructor function for gui
function P5Gui(){
    this.setup = function(){
        // Create Layout GUI
        gui = createGui();
        gui.addGlobals('numShapes', 'bigRadius', 'shape', 'label', 'radius',
            'drawFill', 'fillColor', 'drawStroke', 'strokeColor', 'strokeWidth');

        // Don't loop automatically
        noLoop();
    };

    // check for keyboard events
    this.keyPressed= function() {
        switch(key) {
            // type [F1] to hide / show the GUI
            case 'p':
                visible = !visible;
                if(visible) gui.show(); else gui.hide();
                break;
        }
    }
}