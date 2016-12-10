const EventEmitter = require('events');
const logger = require('../core/logger');

class ParameterController extends EventEmitter {
  constructor() {
    super(); // EventEmitter constructor
    this.moduleName = 'ParameterController';

    this.parameters = {};
  }

  updateParameters(parameters){
      this.parameters = parameters;
      this.emit('data', this.parameters);
      logger.logInfo(this.moduleName, 'updateParameters', JSON.stringify(this.parameters));

      return this.parameters;
  }

  getParameters(){
      return this.parameters;
  }

}

module.exports = new ParameterController();