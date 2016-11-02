const EventEmitter = require('events');

const logger = require('./core/logger');
var Board = require('./board/board');

const ValveService = require('./services/valveService');
const PidHLT = require('./pid/pid-hlt');
const io = require('./core/socket-io'); 

const env = process.env;

if (env.MOCK){
    logger.logWarning('Herms', 'Mock', 'Starting with mocked Board')
    Board = require('./mocks/board-mock');
}

class Herms extends EventEmitter{
    constructor(){
        super();

        this.board = new Board(); 
        this.pidHLT = new PidHLT(this.board);
        this.valveService = new ValveService(this.board);
    }

    start(){
        
        this.board.on('data', (data) => {
            this.emit('pinData', data);    
        });

        this.pidHLT.on('data', (data) => {
            this.emit('pidController', data);    
        });

        this.valveService.on('data', (data) => {
            this.emit('valves', data);
        }) 
        
        this.board.setup((err) => {
            if(!err){
                this.pidHLT.start();
            }
        });
    }

    getPins(){
        return this.pins.getPins();
    }

    writePin(pinName, value, cb){
        this.board.writePin(pinName, value, cb);
    }

    setPidController(config){
        this.pidHLT.setConfig(config);
    }
    getPidController(){
        return this.pidHLT.getStatus();
    }
}

module.exports = Herms;