'use strict';

const EventEmitter = require('events');

const logger = require('../core/logger');
const boardController = require('../board/board-controller').BoardController;
const parameterController = require('../parameters/parameter-controller');
const PID = require('./pid');
const TIME_FRAME = 1000;

class PidController extends EventEmitter {

  constructor(name, longName, offsetParameter, scalingParameter, temperaturePinName) {
    super(); // EventEmitter constructor 

    this.actTemperatureValue = 0;
    this.boardController = boardController;
    this.dummyId = -10; // dummy value
    this.logger = logger;
    this.longName = longName;
    this.moduleName = 'PidController';
    this.name = name;
    this.PID = {};
    this.parameterController = parameterController;
    this.offsetParameter = offsetParameter;
    this.scalingParameter = scalingParameter;
    this.process = this.dummyId;
    this.temperaturePinName = temperaturePinName;
    this.filterTemp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    this._initPid(); // init PID with default settings. Later we should read this from a database
    this._setupListeners();
  }

  start() {
    if (this.process !== this.dummyId) {
      this.logger.logInfo(this.moduleName, 'start', 'Already started');
      return;
    }

    this.logger.logInfo(this.moduleName, 'start', `Starting ${this.name} with settings: Kp=${this.Kp} Ki=${this.Ki} Kd=${this.Kd} setPoint=${this.setPoint}`);

    this.process = setInterval(() => {
      let filteredTemp = 0;
      var i = 0;

      let parsedTemp = parseFloat(this.actTemperatureValue);
      let scaledTemp = (parsedTemp / this.tempScaling) + this.tempOffset;
      this.filterTemp[0] = scaledTemp;

      for (i = 10; i > 0; i--) {
        this.filterTemp[i] = this.filterTemp[i - 1];
      }
      for (i = 1; i < 11; i++) {
        filteredTemp += this.filterTemp[i];
      }
      let currTemp = Math.round((10.0 * (filteredTemp / 10))) / 10;
      
      this.PID.setInput(currTemp);
      this.PID.compute();
      let output = this.PID.getOutput();

      this.emit('data', {
        output: output,
        temperature: currTemp,
        name: this.name
      });

    }, TIME_FRAME);
  }

  stop() {
    this.logger.logInfo(this.moduleName, 'start', 'Stopping pid ...');

    clearInterval(this.process);
  }

  setConfig(config) {
    this.logger.logInfo(this.moduleName, 'setConfig', 'Setting config: ' + JSON.stringify(config));

    this.PID.setPoint(config.setPoint);
    this.PID.setOutput(config.output);
    this.PID.setTunings(config.kp, config.ki, config.kd);
    this.PID.setMode(config.mode);
    this.PID.setOutputLimits(config.outputLimits.min, config.outputLimits.max);
    this.PID.setSampleTime(config.sampleTime);  
    this.PID.setErrThreshold(config.errThreshold);
  }

  getStatus() {
    let status = {
      name: this.name,
      longName: this.longName,
      config: {
        kp: this.PID.getKp(),
        ki: this.PID.getKi(),
        kd: this.PID.getKd(),
        mode: this.PID.getMode(),
        output: this.PID.getOutput(),
        setPoint: this.PID.getSetPoint(),
        outputLimits: this.PID.getOutputLimits(),
        errThreshold: this.PID.getErrThreshold(),
        sampleTime: this.PID.getSampleTime(), 
        tempOffset: this.tempOffset,
        tempScaling: this.tempScaling
      },
      data: {
      }
    }

    return status;
  }

  getName() {
    return this.name;
  }

  getMode() {
    return this.PID.getMode();
  }

  setTempOffset(value) {
    this.tempOffset = value;
  }

  setTempScaling(value) {
    this.tempScaling = value;
    this.PID.set
  }

  setOutputLimits(min, max) {
    this.PID.setOutputLimits(min, max);
  }
  
  setSampleTime(value) {
    this.PID.setSampleTime(value);
  }

 setErrThreshold(value) {
    this.PID.setErrThreshold(value);
  }

  _setupListeners() {
    parameterController.on('data', (data) => {
      this.tempOffset = parameterController.getValue(this.offsetParameter);
      this.tempScaling = parameterController.getValue(this.scalingParameter);

    });

    this.boardController.on('data', data => {
      this.actTemperatureValue = data[this.temperaturePinName].value;
    });
  }

  _initPid() {
    // pidController default setings    
    this.Kp = 300;
    this.Ki = 100;
    this.Kd = 50;
    this.setPoint = 0;
    this.tempOffset = parameterController.getValue(this.offsetParameter);
    this.tempScaling = parameterController.getValue(this.scalingParameter);

    this.PID = new PID(this.actTemperatureValue, this.setPoint, this.Kp, this.Ki, this.Kd, 'direct');
    this.PID.setSampleTime(200);  
    this.PID.setErrThreshold(0);
    this.PID.setOutputLimits(0, 255);
    this.PID.setMode('manual');
    this.PID.setOutput(0);
    
  }
}

module.exports = PidController;
