var Arduino = require('./board/arduino');
var Pins = require('./board/pins');
var PidHLT = require('./pid/pid-hlt');

class Herms {
    constructor(){
        this.pidHLT = new PidHLT(); 
    }

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

    startPidHlt(Kp, Ki, kd, setPoint){
        this.pidHLT.start(Kp, Ki, kd, setPoint);
    }

    stopPidHlt(){
        this.pidHLT.stop();
    }

    writePin(pinName, value, cb){
        this.pins.writePin(pinName, value, cb);
    }



}

module.exports = Herms;