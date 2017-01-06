const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

const logger = require('../core/logger');
const boardController = require('../board/board-controller').BoardController;
const BoardConstants = require('../board/board-controller').BoardConstants;

const OPENED = 'OPENED'
const CLOSED = 'CLOSED';
const ADJUSTING = 'ADJUSTING';
const START_OPEN = 'START_OPEN';
const STOP_OPEN = 'STOP_OPEN';
const START_CLOSE = 'START_CLOSE';
const STOP_CLOSE = 'STOP_CLOSE';

class ValveController extends EventEmitter {

  constructor() {
    super();

    this.moduleName = 'ValveController';
    this.valves = JSON.parse(fs.readFileSync(path.join(__dirname, ("./valves.json"))));
    this.boardController = boardController;

    this.boardController.on('data', (pins) => {
      this._updateValves(pins);
      this.emit('data', this.valves);
    });
  }

  setState(name, state, cb) {
    let valve = this._findValve(name);

    if (valve) {
      if (state === START_OPEN) {
        this.boardController.writePin(valve.pin.open, BoardConstants.PIN_HIGH, cb);
      } else if (state === STOP_OPEN) {
        this.boardController.writePin(valve.pin.open, BoardConstants.PIN_LOW, cb);
      } else if (state === START_CLOSE) {
        this.boardController.writePin(valve.pin.close, BoardConstants.PIN_HIGH, cb);
      } else if (state === STOP_CLOSE) {
        this.boardController.writePin(valve.pin.close, BoardConstants.PIN_LOW, cb);
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

  _updateValves(pins) {
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
        state = OPENED;
      } else if (values.closed > 0) {
        state = CLOSED;
      } else {
        state = ADJUSTING;
      }

      valve.state = state;
    }
  }

}

module.exports.ValveConstants = {
  ADJUSTING,
  CLOSED,
  OPENED,
  START_OPEN,
  STOP_OPEN,
  START_CLOSE,
  STOP_CLOSE,
}

module.exports.ValveController = new ValveController();
