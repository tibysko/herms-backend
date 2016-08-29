var Arduino = require('./arduino');
var Pins = require('./pins');

class Herms {

    start(){
        let arduino = new Arduino();
        let pins = new Pins();

        arduino.setup(function(){
            pins.setup();
        });        
    }

}

module.exports = Herms;