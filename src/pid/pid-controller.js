'use strict';

const EventEmitter = require('events');

const logger = require('../core/logger');
const boardController = require('../board/board-controller').BoardController;
const parameterController = require('../parameters/parameter-controller');
const PID = require('./pid');

class PidController extends EventEmitter {

  constructor(name, longName,offsetParameter, scalingParameter, temperaturePinName) {
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
    this.process = this.dummyId;
    this.temperaturePinName = temperaturePinName;
    this.tempOffset = parameterController.getValue(offsetParameter);;
    this.tempScaling = parameterController.getValue(scalingParameter);;

    this._initPid(); // init PID with default settings. Later we should read this from a database
  }

  start() {
    if (this.process !== this.dummyId) {
      this.logger.logInfo(this.moduleName, 'start', 'Already started');
      return;
    }

    this.logger.logInfo(this.moduleName, 'start', 'Starting with settings: Kp=' + this.Kp + ' Ki=' + this.Ki + ' Kd=' + this.Kd + ' setPoint=' + this.setPoint);

    this.process = setInterval(() => {
      let currTemp = (this.actTemperatureValue / this.tempScaling) + this.tempOffset;

      this.PID.setInput(currTemp);
      this.PID.compute();
      let output = this.PID.getOutput();

      this.emit('data', {
        output: output,
        temperature: currTemp,
        name: this.longName
      });

    }, this.timeframe);
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
        setPoint: this.PID.getSetPoint()
      },
      data: {}
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
  }

  _setupListeners() {
    parameterController.on('data', (data) => {
      let offset = parameterController.getValue(T2_OFFSET);
      let scaling = parameterController.getValue(T2_SCALING);

      this.pidController.setTempOffset(offset);
      this.pidController.setTempScaling(scaling);
    });

    this.boardController.on('data', (data) => {
      this.actTemperatureValue = data[this.temperaturePinName].value;
    });
  }

  _initPid() {
    // pidController default setings    
    this.Kp = 300;
    this.Ki = 100;
    this.Kd = 50;
    this.setPoint = 0;
    this.timeframe = 1000;
    this.tempScaling = 1;
    this.tempOffset = 0;

    this.PID = new PID(this.actTemperatureValue, this.setPoint, this.Kp, this.Ki, this.Kd, 'direct');
    this.PID.setSampleTime(this.timeframe);
    this.PID.setOutputLimits(0, 255);
    this.PID.setMode('manual');
    this.PID.setOutput(0);
  }
}

module.exports = PidController;
