'use strict';

const EventEmitter = require('events');

const logger = require('../core/logger');
const parameterController = require('../parameters/parameter-controller');
const PID = require('./pid');

const T1_OFFSET = 't1_offset';
const T1_SCALING = 't1_scaling';

class PidController extends EventEmitter {

  constructor(board, name, longName, heaterPinName, temperaturePinName) {
    super(); // EventEmitter constructor 

    this.actTemperatureValue = 0;
    this.board = board;
    this.dummyId = -10; // dummy value
    this.heaterPinName = heaterPinName;
    this.name = name; // pid-controller name, used in logging
    this.longName = longName;
    this.pidController = {};
    this.process = this.dummyId;
    this.temperaturePinName = temperaturePinName;

    // pidController default setings    
    this.Kp = 300;
    this.Ki = 100;
    this.Kd = 50;
    this.setPoint = 0;
    this.timeframe = 1000;
    this.tempScaling = 1;
    this.tempOffset = 0;

    parameterController.on('data', (data) => {
      this.tempOffset =  parseFloat(data[T1_OFFSET].value);
      this.tempScaling = parseFloat(data[T1_SCALING].value);
    });
  }

  start() {
    if (this.process !== this.dummyId) {
      logger.logInfo(this.name, 'start', 'Already started');
      return;
    }

    logger.logInfo(this.name, 'start', 'Starting with settings: Kp=' + this.Kp + ' Ki=' + this.Ki + ' Kd=' + this.Kd + ' setPoint=' + this.setPoint);

    this.board.on('data', (data) => {
      this.actTemperatureValue = data[this.temperaturePinName].value;
    });

    this.pidController = new PID(this.actTemperatureValue, this.setPoint, this.Kp, this.Ki, this.Kd, 'direct');

    this.pidController.setSampleTime(this.timeframe);
    this.pidController.setOutputLimits(0, 255);
    this.pidController.setMode('manual');
    this.pidController.setOutput(0);

    logger.logInfo(this.name, 'start', 'Starting intervall...');

    this.process = setInterval(() => {
      let currTemp = (this.actTemperatureValue / this.tempScaling) + this.tempOffset;

      this.pidController.setInput(currTemp);
      this.pidController.compute();
      let output = this.pidController.getOutput();

      if (this.heaterPinName) {
        this.board.writePin(this.heaterPinName, output, function () {});
      }

      this.emit('data', {
        name: this.name,
        output: output,
        temperature: currTemp
      });

    }, this.timeframe);
  }

  stop() {
    logger.logInfo(this.name, 'start', 'Stopping pid ...');

    clearInterval(this.process);
  }

  setConfig(config) {
    logger.logInfo(this.name, 'setConfig', 'Setting config: ' + JSON.stringify(config));

    this.pidController.setPoint(config.setPoint);
    this.pidController.setOutput(config.output);
    this.pidController.setTunings(config.kp, config.ki, config.kd);
    this.pidController.setMode(config.mode);
  }

  getStatus() {
    let status = {
      name: this.name,
      longName: this.longName,
      config: {
        kp: this.pidController.getKp(),
        ki: this.pidController.getKi(),
        kd: this.pidController.getKd(),
        mode: this.pidController.getMode(),
        output: this.pidController.getOutput(),
        setPoint: this.pidController.getSetPoint()
      },
      data: {}
    }

    return status;
  }

  getName() {
    return this.name;
  }

  getMode() {
    return this.pidController.getMode();
  }

}

module.exports = PidController;
