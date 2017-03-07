const boardController = require('../board/board-controller').BoardController;
const logger = require('../core/logger');
const parameterController = require('../parameters/parameter-controller');
const pidController = require('../pid/mlt-pid-controller');
const ValveConstants = require('./valve-controller').ValveConstants;
const valveController = require('./valve-controller').ValveController;

const HYSTERESIS = 'HE_HW_IN_Hysteresis';
const VALVE_STEP = 'HE_HW_IN_Step';
const HE_HW_IN_Interval = 'HE_HW_IN_Interval';
const HE_HW_IN = 'HE_HW_IN';

class ValveControllerHeHwIn {

  constructor() {
    this.boardController = boardController;
    this.parameterController = parameterController;
    this.moduleName = 'ValveControllerHeHwIn';
    this.pidController = pidController;
    this.valveController = valveController;

    this.output = 0;
    this.temperature = 0;
    this.valveHysteresis = 5;
    this.interval = 1000; // needs to be 
    this.intervalRef = {};
    this.valveStep = 25;
    this.valveSetPoint = 0;
    this.valveActPos = 0;
    this.tempMode = '';
  }

  start() {
    logger.logInfo(this.moduleName, 'start', 'Starting Valve-controller-He-Hw-in');

    // Load saved parameters
    this._updateParameters();

    // Setup listener for new parameters
    this._setupListeners();

    // Start program loop
    this._restartLoop();
  }

  _computeValvePos() {
    if (this.tempMode !== this.pidController.getMode()) {
      this.tempMode = this.pidController.getMode();
      this.valveController.setState(HE_HW_IN, ValveConstants.STOP_CLOSE, err => this._logg(err, 10));
      this.valveController.setState(HE_HW_IN, ValveConstants.STOP_OPEN, err => this._logg(err, 20));
    }

    if (this.pidController.getMode().toLowerCase() === 'auto') {
      if (Math.abs(this.output - this.valveSetPoint) > this.valveStep || this.output >= 100) {
        this.valveSetPoint = this.output;
      }

      if (Math.abs(this.valveActPos - this.valveSetPoint) > this.valveHysteresis) {
        if (this.valveActPos > this.valveSetPoint) {
          this.valveController.setState(HE_HW_IN, ValveConstants.START_CLOSE, err => this._logg(err, 30));
        } else {
          this.valveController.setState(HE_HW_IN, ValveConstants.START_OPEN, err => this._logg(err, 40));
        }
      } else {
        this.valveController.setState(HE_HW_IN, ValveConstants.STOP_CLOSE, err => this._logg(err, 50));
        this.valveController.setState(HE_HW_IN, ValveConstants.STOP_OPEN, err => this._logg(err, 60));
      }
    }
  }

  _logg(err, position) {
    if (err) logger.logError(this.moduleName, 'loggError', `Failed to set valve state for position ${position}`);
  }

  _setupListeners() {
    this.parameterController.on('data', () => {
      this._updateParameters();

      // if new data restart program loop
      this._restartLoop();
    });

    this.pidController.on('data', (data) => {
      this.output = data.output;
      this.temperature = data.temperature;
    });

    this.boardController.on('data', (data) => {
      if (data['HE_HW_IN_ACTPOS']) {
        this.valveActPos = data['HE_HW_IN_ACTPOS'].value; //(l1HltValue / this.levelScaling) + this.levelOffset; Behöver parametrar HE_HW_IN_Scaling, HE_HW_IN_Offset 
      }
    });
  }

  _updateParameters() {
    this.valveHysteresis = this.parameterController.getValue(HYSTERESIS);
    this.valveStep = this.parameterController.getValue(VALVE_STEP);
    this.interval = this.parameterController.getValue(HE_HW_IN_Interval);
  }

  _restartLoop() {
    logger.logInfo(this.moduleName, '_restartLoop', 'Restarting loop...');
    clearInterval(this.intervalRef);
    this.intervalRef = setInterval(() => this._computeValvePos(), this.interval);
  }
}

module.exports = new ValveControllerHeHwIn();
