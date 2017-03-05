const async = require('async');

const logger = require('../core/logger');
const ValveConstants = require('../valve/valve-controller').ValveConstants;
const valveController = require('../valve/valve-controller').ValveController;

class PhaseUtil {

  constructor() {
    this.moduleName = 'PhaseUtil';
    this.valveController = valveController;
  }

  checkValves(activatedPhase, cb) {
    logger.logInfo(this.moduleName, 'checkValves', 'Checking valves position according to phase..')

    let valves = this.valveController.getValves();
    let valvesNotOk = [];

    for (let valve of valves) {
      let phaseValve = activatedPhase.valves.find(phaseValve => phaseValve.name === valve.name);
      
      if (phaseValve.state !== valve.state) {
        valvesNotOk.push(valve.name);
      }
    }

    if (valvesNotOk.length > 0) {
      let err = `The following valves was not set: ${JSON.stringify(valvesNotOk)}`;
      logger.logError(this.moduleName, 'activatePhase', err);

      return cb(new Error(err));
    } else {
      logger.logInfo(this.moduleName, 'checkValves', 'Valves position ok.')

      return cb(null); // all ok!
    }
  }

  closeValves(callback) {
    let valves = this.valveController.getValves();
    logger.logInfo(this.moduleName, 'closeValves', 'Closing valves...');

    async.eachSeries(valves, (valve, cb) => {
      this.valveController.setState(valve.name, ValveConstants.START_CLOSE, cb);
    }, callback);
  }

  isAllValvesClosed(callback) {
    let valves = this.valveController.getValves();
    logger.logInfo(this.moduleName, 'isAllValvesClosed', 'Check all valves closed...');

    for (let valve of valves) {
      if (valve.state !== ValveConstants.CLOSED) {
        let err = `Valve ${valve.name} not closed`;
        logger.logError(this.moduleName, 'isAllValvesClosed', err);

        return callback(new Error(err));
      }
    }

    logger.logInfo(this.moduleName, 'isAllValvesClosed', 'All valves closed!');
    // everythin was ok, return
    callback(null);
  }

  setValvesForPhase(phase, callback) {
    logger.logInfo(this.moduleName, 'setValvesForPhase', 'Ajusting valves for new phase...');

    async.eachSeries(phase.valves, (valve, cb) => {
      let valveCmd = phase[valve.name] === ValveConstants.OPENED ? ValveConstants.START_OPEN : ValveConstants.START_CLOSE;

      this.valveController.setState(valve.name, valveCmd, cb);
    }, callback);
  }
}

module.exports = new PhaseUtil();
