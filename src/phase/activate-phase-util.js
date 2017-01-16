const async = require('async');
const fs = require('fs');
const path = require('path');

const logger = require('../core/logger');
const ValveConstants = require('../valve/valve-controller').ValveConstants;
const valveController = require('../valve/valve-controller').ValveController;

class PhaseUtil {

  constructor() {
    this.valveController = valveController;
  }

  checkValves(activatedPhase, cb) {
    let valves = this.valveController.getValves();
    let valvesNotOk = [];

    for (let valve of valves) {
      let desiredState = activatedPhase[valve.name] === ValveConstants.OPENED ? ValveConstants.OPENED : ValveConstants.CLOSED;

      if (desiredState !== valve.state) {
        valvesNotOk.push(valve.name);
      }
    }

    if (valvesNotOk.length > 0) {
      let err = `The following valves was not set: ${JSON.stringify(valvesNotOk)}`;
      logger.logError(this.moduleName, 'activatePhase', err);

      return cb(new Error(err));
    } else {
      return cb(null); // all ok!
    }
  }

  closeValves(callback) {
    let valves = this.valveController.getValves();

    async.eachSeries(valves, (valve, cb) => {
      this.valveController.setState(valve.name, ValveConstants.STOP_CLOSE, cb);
    }, callback);
  }

  isAllValvesClosed(callback) {
    let valves = this.valveController.getValves();

    for (let valve of valves) {
      if (valve.state !== ValveConstants.CLOSED) {
        let err = `Valve ${valve.name} not closed`;
        logger.logError(this.moduleName, '_isAllValvesClosed', err);
        return callback(new Error(err));
      }

      callback(null);
    }
  }

  setValvesForPhase(phase, callback) {
    async.eachSeries(phase.valves, (valve, cb) => {
      let desiredState = activatedPhase[valve.name] === ValveConstants.OPENED ? ValveConstants.OPENED : ValveConstants.CLOSED;

      this.valveController.setState(valve.name, desiredState, cb);
    }, callback);
  }
}

module.exports = new PhaseUtil();
