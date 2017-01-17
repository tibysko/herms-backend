const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

const logger = require('../core/logger');

const PARAMETERS_FILE = './parameters.json';

class ParameterController extends EventEmitter {
  constructor() {
    super(); // EventEmitter constructor

    this.moduleName = 'ParameterController';
    this.parameters = JSON.parse(fs.readFileSync(path.join(__dirname, (PARAMETERS_FILE))));
  }

  updateParameter(name, value) {
    if (!this.parameters[name]) {
      let errMsg = 'Parameter [' + name + '] not found';
      logger.logError(this.moduleName, 'updateParameter', errMsg);

      return new Error(errMsg);
    }

    let parameter = this.parameters[name];
    let oldValue = parameter.value;
    parameter.changed = new Date();
    parameter.value = value;

    logger.logInfo(this.moduleName, 'updateParameter', '[' + name + ']: ' + oldValue + ' => ' + value);

    // Notify listeners of new parameter value
    this.emit('data');
   
    this._saveParameters();

    return parameter;
  }

  getParameters() {
    return this.parameters;
  }

  getValue(parameterName) {
    if (!this.parameters[parameterName]) {
      logger.logError(this.moduleName, 'GetParameter', `Parameter ${parameterName} not found`);
      return undefined;
    } else {
      return this.parameters[parameterName].value;
    }

  }

  _saveParameters() {
    fs.writeFileSync(path.join(__dirname, PARAMETERS_FILE), JSON.stringify(this.parameters), null, '  ');
  }

}

module.exports = new ParameterController();
