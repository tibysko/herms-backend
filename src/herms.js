const EventEmitter = require('events');

const logger = require('./core/logger');
var Board = require('./board/board');
const PidController = require('./pid/pid-controller');
const io = require('./core/socket-io');
const PhaseController = require('./phase/phase-controller');
const ValveController = require('./valve/valve-controller');
const ValveControllerHeHwIn = require('./valve/valve-controller-he-hw-in');
const parameterController = require('./parameters/parameter-controller');

const env = process.env;

if (env.MOCK) {
    logger.logWarning('Herms', 'Mock', 'Starting with mocked Board')
    Board = require('./mocks/board-mock');
}

class Herms extends EventEmitter {
    constructor() {
        super();

        this.board = new Board();

         // Setup valve
        this.valveController = new ValveController(this.board);

        // Setup pid controllers
        this.pidControllers = [];
        this.pidControllers.push(new PidController(this.board, 'pidCtrlHLT', 'Pid controller HLT' ,'HLT_HEATER', 'T1_HLT'));

        let pidControllerMLT = new PidController(this.board, 'pidCtrlMLT', 'Pid controller MLT', undefined, 'T2_HE_WORT_OUT');
        this.pidControllers.push(pidControllerMLT);

        // Setup special program for valve he-hw-in
        let valveCtrlHeHwIn = new ValveControllerHeHwIn(pidControllerMLT, this.valveController, this.board);        

        // Setup phase
        this.phaseController = new PhaseController(this.valveController, this.board);

        // Setup parameter 
        this.parameterController = parameterController;

        // Add eventhandlers
        this._addEmitter('pins', this.board, false);
        this._addEmitter('valves', this.valveController, false);

        this.aggregatedCtrlData = [];
        for (let pidController of this.pidControllers) {
            this._aggregateEventData(pidController, this.aggregatedCtrlData);
        }

        // take first controller and emit all controller data
        if (this.pidControllers.length > 0) {
            this.pidControllers[0].on('data', (ignore) => {
                this.emit('controllers', this.aggregatedCtrlData);
            });
        }
    }

    start() {
        this.board.setup((err) => {
            if (!err) {
                for (let pidController of this.pidControllers) {
                    pidController.start();
                }
            }
        });
    }

    getPins() {
        return this.board.getPinData();
    }

    writePin(pinName, value, cb) {
        this.board.writePin(pinName, value, cb);
    }

    setPidController(name, config) {
        let controller = {};

        for (let pidController of this.pidControllers) {
            if (pidController.getName() === name) {
                controller = pidController;
                break;
            }
        }

        if (controller) {
            controller.setConfig(config);
        } else {
            logger.logWarning(this.module, 'setPidController', 'Could not find controller: ' + name);
        }
    }

    getPidControllers() {
        let controllerData = [];

        for (let controller of this.pidControllers) {
            controllerData.push(controller.getStatus());
        }

        return controllerData;
    }

    getValves(){
        return this.valveController.getValves();
    }

    setValve(name, state, cb) {
       this.valveController.setState(name, state, cb);
    }

    getStatus() {
        return this.aggregatedData;
    }

    updatePhase(id, phase) {
        return this.phaseController.updatePhase(id, phase);
    }

    activatePhase(id){
        return this.phaseController.activatePhase(id);
    }

    createPhase(phase){
        return this.phaseController.createPhase(phase);
    }

    deletePhase(id){
        return this.phaseController.deletePhase(id);
    }

    getPhases(){
        return this.phaseController.getPhases();
    }

    getParameters(){
        return this.parameterController.getParameters();
    }

    updateParameter(name, value){
        return this.parameterController.updateParameter(name, value);
    }

    _addEmitter(eventName, eventObject) {
        eventObject.on('data', (data) => {
            this.emit(eventName, data);
        });
    }

    _aggregateEventData(eventObject, dataArray) {
        eventObject.on('data', (data) => {
            let itemIndex = -1;

            for (let i = 0; i < dataArray.length; i++) {
                if (dataArray[i].name == data.name) {
                    itemIndex = i;
                    break;
                }
            }

            if (itemIndex >= 0) {
                dataArray[itemIndex] = data;
            } else {
                dataArray.push(data);
            }
        });
    }
}

// create singleton
var herms = new Herms();

module.exports = herms;