const logger = require('../core/logger');

const hltPidController = require('./hlt-pid-controller');
const mltPidController = require('./mlt-pid-controller');

class PidControllerRegistry {
  constructor() {
    this.controllers = [];
    this.controllers.push(hltPidController);
    this.controllers.push(mltPidController);
  }

  setPidController(name, config) {
    let controller = undefined;

    for (let pidController of this.controllers) {
      if (pidController.getName() === name) {
        controller = pidController;
        break;
      }
    }

    if (!controller) {
      let errMsg = `Could not find controller: ${name}`;
      logger.logError(this.moduleName, 'setPidController', errMsg);
      throw new Error(errMsg);
    }

    controller.setConfig(config);
  }

  getPidControllerStatus() {
    let controllerData = [];

    for (let controller of this.controllers) {
      controllerData.push(controller.getStatus());
    }

    return controllerData;
  }

  getPidControllers() {
    return this.controllers;
  }

  startPidControllers() {
    for (let controller of this.getPidControllers()) {
      controller.start();
    }
  }
}

module.exports = new PidControllerRegistry();
