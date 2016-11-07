const EventEmitter = require('events');

const logger = require('./core/logger');
var Board = require('./board/board');

const ValveService = require('./services/valveService');
const PidController = require('./pid/pid-controller');
const io = require('./core/socket-io');

const env = process.env;

if (env.MOCK) {
    logger.logWarning('Herms', 'Mock', 'Starting with mocked Board')
    Board = require('./mocks/board-mock');
}

class Herms extends EventEmitter {
    constructor() {
        super();

        this.board = new Board();

        // Setup pid controllers
        this.pidControllers = [];
        this.pidControllers.push(new PidController(this.board, 'pidCtrlHLT', 'HLT_HEATER', 'T1_HLT'));
        // TODO insert new pins!
        this.pidControllers.push(new PidController(this.board, 'pidCtrlMLT', 'HLT_HEATER', 'T1_HLT'));

        // Setup valve
        this.valveService = new ValveService(this.board);

        this.pidControllerData = {};
        this.aggregatedData = {};

        // Add eventhandlers
        this._addEventHandler('pins', this.board);
        this._addEventHandler('valves', this.valveService);

        for (let pidController of this.pidControllers) {
            this._addEventHandler(pidController.name, pidController);
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

    setPidController(config) {
        for (let pidController of this.pidControllers) {
            if (pidController.getName() === config.name) {
                this.pidHLT.setConfig(config);
                break;
            }
        }
    }

    getPidControllers() {
        return this.pidHLT.getStatus();
    }

    // Underscore means private methods.. ugly!
    _addEventHandler(propertyName, eventObject) {
        eventObject.on('data', (data) => {
            this.aggregatedData[propertyName] = data;
        });
    }
}

module.exports = Herms;