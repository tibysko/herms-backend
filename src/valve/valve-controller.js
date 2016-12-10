const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');


const logger = require('../core/logger');
const BoardConstants = require('../board/board-constants');
const ValveConstants = require('./valve-constants');


class ValveController extends EventEmitter {

    constructor(board) {
        super();

        this.moduleName = 'ValveController';
        this.valves = JSON.parse(fs.readFileSync(path.join(__dirname, ("../config/valves.json"))));
        this.board = board;

        this.board.on('data', (pins) => {

            for (let valve of this.valves) {
                let values = {
                    opened: pins[valve.pin.opened].value,
                    closed: pins[valve.pin.closed].value,
                }

                if (pins[valve.pin.actPos]) {
                    values.actPos = pins[valve.pin.actPos].value;
                }

                valve.in = values;

                let state = {};

                if (values.opened > 0) {
                    state = ValveConstants.OPENED;
                } else if (values.closed > 0) {
                    state = ValveConstants.CLOSED;
                } else {
                    state = ValveConstants.ADJUSTING;
                }

                valve.state = state; 
            }

            this.emit('data', this.valves);
        });
    }

    setState(name, state, cb) {
        let valve = this._findValve(name);

        if (valve) {
            if (state == ValveConstants.START_OPEN) {
                this.board.writePin(valve.pin.open, BoardConstants.PIN_HIGH, cb);
            } else if (state == ValveConstants.STOP_OPEN) {
                this.board.writePin(valve.pin.open, BoardConstants.PIN_LOW, cb);
            } else if (state == ValveConstants.START_CLOSE) {
                this.board.writePin(valve.pin.close, BoardConstants.PIN_HIGH, cb);
            } else if (state == ValveConstants.STOP_CLOSE) {
                this.board.writePin(valve.pin.close, BoardConstants.PIN_LOW, cb);
            } else {
                let err = 'State [' + state + '] not found';
                logger.logError(this.moduleName, 'setState', err);
                cb(new Error(err));
            }
        } else {
            let err = 'Valve [' + name + '] not found';
            logger.logError(this.moduleName, 'setState', err);
            cb(new Error(err));
        }
    }

    getValves() {
        return this.valves;
    }

    _findValve(name) {
        let foundValve;

        for (let valve of this.valves) {
            if (valve.name === name) {
                foundValve = valve;
                break;
            }
        }

        return foundValve;
    }
}

module.exports = ValveController;