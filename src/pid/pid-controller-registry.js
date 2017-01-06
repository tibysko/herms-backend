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
    let controller = {};

    for (let pidController of this.controllers) {
      if (pidController.getName() === name) {
        controller = pidController;
        break;
      }
    }

    if (controller) {
      controller.setConfig(config);
    } else {
      logger.logWarning(this.moduleName, 'setPidController', 'Could not find controller: ' + name);
    }
  }

  getPidControllerStatus() {
    let controllerData = [];

    for (let controller of this.controllers) {
      controllerData.push(controller.getStatus());
    }

    return controllerData;
  }

  getPidControllers(){
    return this.controllers;
  }
}

module.exports = new PidControllerRegistry();
