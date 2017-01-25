'use strict'

const fs = require('fs');
const path = require('path');
const uuidV4 = require('uuid/v4');
const async = require('async');

const BoardConstants = require('../board/board-controller').BoardConstants;
const boardController = require('../board/board-controller').BoardController;
const logger = require('../core/logger');
const activatePhaseUtil = require('./activate-phase-util');
const ValveConstants = require('../valve/valve-controller').ValveConstants;
const valveController = require('../valve/valve-controller').ValveController;

const PHASES_FILE = './phases.json';
const CLOSING_VALVES_SLEEP = 10000; // ms 
const ADJUSTING_VALVES_SLEEP = 10000;

class PhaseController {

  constructor() {
    this.activatePhaseUtil = activatePhaseUtil;
    this.boardController = boardController;
    this.moduleName = 'PhaseController';
    this.phases = JSON.parse(fs.readFileSync(path.join(__dirname, (PHASES_FILE))));
    this.valveController = valveController;
  };

  activatePhase(id) {
    let phase = this._findPhase(id);

    if (!phase) {
      let err = `Phase ${id} not found`;
      logger.logError(this.moduleName, 'activatePhase', err);

      throw new Error(err);
    }

    //If any functions in the series pass an error to its callback, no more functions are run,
    //and _resolveResult is immediately called with the value of the error,
    async.series([
      cb => this.boardController.writePin('HW_PUMP', BoardConstants.PIN_LOW, cb),
      cb => this.boardController.writePin('WORT_PUMP', BoardConstants.PIN_LOW, cb),
      cb => this.activatePhaseUtil.closeValves(cb),
      cb => setTimeout(cb, CLOSING_VALVES_SLEEP), // wait X ms until check closed valves
      cb => this.activatePhaseUtil.isAllValvesClosed(cb),
      cb => this.activatePhaseUtil.setValvesForPhase(phase, cb),
      cb => setTimeout(cb, ADJUSTING_VALVES_SLEEP), // wait X xs until check valves
      cb => this.activatePhaseUtil.checkValves(phase, cb),
      cb => this._updateActivePhase(phase, this.phases, cb)
    ], (err, results) => this._resolveResult(err, results, phase));

    return phase;
  }

  createPhase(phase) {
    let validationError = this._validatePhase(phase);

    let newPhase = {
      'name': phase.name,
      'id': uuidV4(), // generate unique identifier
      'valves': []
    };

    for (let valve of phase.valves) {
      if (valve.name && (valve.state === ValveConstants.OPENED || valve.state === ValveConstants.CLOSED)) {
        newPhase.valves.push(valve);
      } else {
        let errMsg = `Phase ${phase.name}, invalid valve state : ${valve.state} for valve: ${valve.name}`;
        logger.logError(this.moduleName, 'createPhase', errMsg);
        
        throw new Error(errMsg);
      }
    }

    this.phases.push(newPhase);

    this._savePhasesToFile();

    return newPhase;
  }

  updatePhase(id, phase) {
    let validationError = this._validatePhase(phase);

    let existingPhase = this._findPhase(id);

    if (!existingPhase) {
      let errMsg = `Phase ${id} not found`;
      logger.logError(this.moduleName, 'updatePhase', errMsg);
      
      throw new Error(errMsg);
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
      let err = `Could not find phase with id ${id}`;
      logger.logError(this.module, 'deletePhase', err);
      throw new Error(err);
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

  _findPhase(id) {
    return this.phases.find(phase => phase.id === id);
  }

  _resolveResult(err, results, phase) {
    if (err) {
      logger.logError(this.moduleName, '_resolveResult', err);
    }
  }

  _savePhasesToFile() {
    fs.writeFileSync(path.join(__dirname, PHASES_FILE), JSON.stringify(this.phases), null, '  ');
  }

  _updateActivePhase(activatedPhase, cb) {
    // set phase to active and "deactivate" all others
    for (let phase of this.phases) {
      phase.activated = false;
    }

    activatedPhase.activated = true;
    this._savePhasesToFile();
    cb(null);
  }

  _validatePhase(phase) {
    if (!phase || !phase.name) {
      let errMsg = 'Name not provided';
      logger.logError(this.moduleName, 'createPhase', errMsg);

      throw new Error('errMsg');
    } else if (!phase.valves) {
      let errMsg = 'Valves not provided';
      logger.logError(this.moduleName, 'createPhase', errMsg);

      throw new Error(errMsg);
    }
  }
}

module.exports = new PhaseController();
