var Arduino = require('./arduino');
var Pins = require('./pins');

class Herms {

    start(){
        this.arduino = new Arduino();
        this.pins = new Pins();

        this.arduino.setup(() => {
            this.pins.setup();
        });        
    }

    getPins(){
        return this.pins.getPins();
    }

}

module.exports = Herms;