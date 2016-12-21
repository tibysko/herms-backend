'use strict'

const fs = require('fs');
const path = require('path');
const uuidV4 = require('uuid/v4');
const async = require('async');

const logger = require('../core/logger');
const ValveConstants = require('../valve/valve-controller').ValveConstants;
const BoardConstants = require('../board/board-controller').BoardConstants;

const PHASES_FILE = './phases.json';

class PhaseController {

  constructor(valveController, board) {
    this.board = board;
    this.moduleName = 'PhaseController';
    this.phases = JSON.parse(fs.readFileSync(path.join(__dirname, (PHASES_FILE))));
    this.valveController = valveController;
  };

  activatePhase(id) {
    let foundPhase = this._findPhase(id);

    if (!foundPhase) {
      let err = 'Phase [' + id + '] not found';
      logger.logError(this.moduleName, 'activatePhase', err);

      return new Error(err);
    }

    // TODO check valves

    // stop pumps
    this.board.writePin('HW_PUMP', BoardConstants.PIN_LOW, function () {});
    this.board.writePin('WORT_PUMP', BoardConstants.PIN_LOW, function () {});

    let valves = this.valveController.getValves();

    async.eachSeries(foundPhase.valves, (valve, callback) => {
      setTimeout(() => {
        let newState = (valve.state === ValveConstants.OPENED) ? ValveConstants.START_OPEN : ValveConstants.START_CLOSE;
        this.valveController.setState(valve.name, newState, function () {});
        callback();
      }, 200);
    }, function (err) {
      console.log('done');
    });

    /*
      let phaseValves = foundPhase.valves;
      let i = 0;
      let length = phaseValves.length;

      let ref = setInterval(() => {
        if (i < length) {
          let newState = (phaseValves[i].state === ValveConstants.OPENED) ? ValveConstants.START_OPEN : ValveConstants.START_CLOSE;
          this.valveController.setState(phaseValves[i].name, newState, function () {});
        } else {
          clearInterval(ref);
        }
        i = i + 1;
      }, 200);*/


    /* for (let valve of foundPhase.valves) {
       let newState = (valve.state === ValveConstants.OPENED) ? ValveConstants.START_OPEN : ValveConstants.START_CLOSE;
       console.log(valve.name + ' ' + newState);
       this.valveController.setState(valve.name, newState, function () {});
     }*/

    setTimeout(() => this._checkValves(foundPhase), 20000); // check valve state after 6000 ms

    // set phase to active and "deactivate" all others
    for (let phase of this.phases) {
      phase.activated = false;
    }
    foundPhase.activated = true;

    this._savePhasesToFile();

    return foundPhase;
  }

  createPhase(phase) {
    let validationError = this._validatePhase(phase);

    if (validationError instanceof Error) {
      return validationError;
    }

    let newPhase = {
      'name': phase.name,
      'id': uuidV4(), // generate unique identifier
      'valves': []
    };

    for (let valve of phase.valves) {
      if (valve.name && (valve.state === ValveConstants.OPENED || valve.state === ValveConstants.CLOSED)) {
        newPhase.valves.push(valve);
      } else {
        let errMsg = 'Phase [ ' + phase.name + ' ], invalid valve state : ' + valve.state + ' for valve: ' + valve.name;
        logger.logError(this.moduleName, 'createPhase', errMsg);
        return new Error(errMsg);
      }
    }

    this.phases.push(newPhase);

    this._savePhasesToFile();

    return newPhase;
  }

  updatePhase(id, phase) {
    let validationError = this._validatePhase(phase);

    if (validationError instanceof Error) {
      return validationError;
    }

    let existingPhase = this._findPhase(id);

    if (!existingPhase) {
      let errMsg = 'Phase [' + id + '] not found';
      logger.logError(this.moduleName, 'updatePhase', errMsg);
      return new Error(errMsg);
    }

    existingPhase.name = phase.name;
    existingPhase.valves = phase.valves;
    existingPhase.activated = phase.activated;

    this._savePhasesToFile();

    return existingPhase;
  }

  deletePhase(id) {
    let existingPhase = this._findPhase(id);

    if (!existingPhase) {
      let err = 'Could not find phase with id ' + id;
      logger.logError(this.module, 'deletePhase', err);
      return new Error(err);
    }

    // create new array and filter out removed phase
    this.phases = this.phases.filter((value) => {
      return value.id !== id;
    });

    this._savePhasesToFile();

    return id;
  }

  getPhases() {
    return this.phases;
  }

  _checkValves(activatedPhase) {
    let valves = this.valveController.getValves();
    let valvesNotOk = [];

    for (let valve of valves) {
      let desiredState = activatedPhase[valve.name] === ValveConstants.OPENED ? ValveConstants.OPENED : ValveConstants.CLOSED;

      if (desiredState !== valve.state) {
        valvesNotOk.push(valve.name);
      }
    }

    async.eachSeries(activatedPhase.valves, (valve, callback) => {
      setTimeout(() => {
        // Stop all valves movement 
        this.valveController.setState(valve.name, ValveConstants.STOP_CLOSE, function () {});
        this.valveController.setState(valve.name, ValveConstants.STOP_OPEN, function () {});
        callback();
      }, 200);
    }, function (err) {
      console.log('done ' + err.message);
    });

    if (valvesNotOk.length > 0) {
      logger.logError(this.moduleName, 'activatePhase', 'The following valves was not set: ' + JSON.stringify(valvesNotOk));
    }
  }

  _validatePhase(phase) {
    if (!phase || !phase.name) {
      let errMsg = 'Name not provided';
      logger.logError(this.moduleName, 'createPhase', errMsg);

      return new Error('name note provided');
    } else if (!phase.valves) {
      let errMsg = 'Valves not provided';
      logger.logError(this.moduleName, 'createPhase', errMsg);

      return new Error(errMsg);
    } else {
      return undefined;
    }
  }

  _findPhase(id) {
    let foundPhase;

    for (let phase of this.phases) {
      if (phase.id === id) {
        foundPhase = phase;
        break;
      }
    }

    return foundPhase;
  }

  _savePhasesToFile() {
    fs.writeFileSync(path.join(__dirname, PHASES_FILE), JSON.stringify(this.phases), null, '  ');
  }
}

module.exports = PhaseController;
