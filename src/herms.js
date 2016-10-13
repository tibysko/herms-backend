//var Arduino = require('./board/arduino');
//var Pins = require('./board/pins');

var Board = require('./board/board');
var PidHLT = require('./pid/pid-hlt');
var io = require('./core/socket-io'); 
const EventEmitter = require('events');

class Herms extends EventEmitter{
    constructor(){
        super();
        //this.arduino = new Arduino();
        //this.pins = new Pins();
        this.board = new Board(); 
        this.pidHLT = new PidHLT(this.board);
    }

    start(){
        
        this.board.on('data', (data) => {
            this.emit('pinData', data);    
        });

        this.pidHLT.on('data', (data) => {
            this.emit('pidController', data);    
        }); 
        
        this.board.setup();
        this.pidHLT.start();
    }

    getPins(){
        return this.pins.getPins();
    }

    writePin(pinId, value, cb){
        this.board.writePin(pinId, value, cb);
    }

    setSetPoint(value){
        this.pidHLT.setSetPoint(value);
    }

    setOutput(value){
       this.pidHLT.setOutput(value);
    }

    setMode(mode){ 
        this.pidHLT.setMode(mode);
    }
}

module.exports = Herms;