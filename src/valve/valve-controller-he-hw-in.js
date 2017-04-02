const boardController = require('../board/board-controller').BoardController;
const logger = require('../core/logger');
const parameterController = require('../parameters/parameter-controller');
const pidController = require('../pid/mlt-pid-controller');
const ValveConstants = require('./valve-controller').ValveConstants;
const valveController = require('./valve-controller').ValveController;

const VALVE_STEP = 'HE_HW_IN_Step';
const HE_HW_IN_HYST = 'HE_HW_IN_Hysteresis';
const HE_HW_IN = 'HE_HW_IN';
const VALVE_SCALING = 'HE_HW_IN_Scaling';
const VALVE_OFFSET = 'HE_HW_IN_Offset';
const HE_HW_IN_Interval = 'HE_HW_IN_Interval';
const MLTOUTTEMP_OFFSET = 't3_offset';
const MLTOUTTEMP_SCALING = 't3_scaling';

class ValveControllerHeHwIn {

  constructor() {
    this.boardController = boardController;
    this.parameterController = parameterController;
    this.moduleName = 'ValveControllerHeHwIn';
    this.pidController = pidController;
    this.valveController = valveController;

    this.output = 0;
    this.temperature = 0;
    this.pidSetPoint = 0;

    this.valveHysteresis = 5;

    this.valveScaling = 1;
    this.valveOffset = 0;
    this.interval = 1000; // needs to be 
    this.intervalRef = {};
    this.valveStep = 25;
    this.valveSetPoint = 0;
    this.valveActPos = 0;
    this.pidMode = '';
    this.stopCmdSent = false;
    this.startCloseSent = false;
    this.startOpenSent = false;

    this.mltOutTempScaling = 1;
    this.mltOutTempOffset = 0;
    this.mltOutTempFiltered = 0;


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

  getValvePos() {
    return this.valveActPos;
  }
  getMltOutTemp() {
    return this.mltOutTempFiltered;
  }

  _checkPidMode() {
    if (this.pidMode !== this.pidController.getMode()) {
      this.pidMode = this.pidController.getMode();
      this.valveController.setState(HE_HW_IN, ValveConstants.STOP_CLOSE, err => this._logg(err, 10));
      this.valveController.setState(HE_HW_IN, ValveConstants.STOP_OPEN, err => this._logg(err, 20));
    }
    this._computeValvePos()

  }


  _computeValvePos() {
    if (this.pidMode.toLowerCase() === 'auto') { //Change to autobutton
      if (this.temperature < this.pidSetPoint - this.valveHysteresis) {
        this.valveController.setState(HE_HW_IN, ValveConstants.STOP_CLOSE, err => this._logg(err, 10));
        this.valveController.setState(HE_HW_IN, ValveConstants.START_OPEN, err => this._logg(err, 40));
      } else {
        this.valveController.setState(HE_HW_IN, ValveConstants.START_CLOSE, err => this._logg(err, 30));
        this.valveController.setState(HE_HW_IN, ValveConstants.STOP_OPEN, err => this._logg(err, 20));
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
      this.pidSetPoint  = data.setPoint;
  });

    this.boardController.on('data', (data) => {
      if (data['HE_HW_IN_ACTPOS']) {
        let valveValue = parseFloat(data['HE_HW_IN_ACTPOS'].value);
        this.valveActPos = Math.round((10.0 * ((valveValue / this.valveScaling) + this.valveOffset))) / 10;
      }
      if (data['T3_MLT_WORT_OUT']) {
        let temp = parseFloat(data['T3_MLT_WORT_OUT'].value);
        this.mltOutTempFiltered = Math.round((10.0 * ((temp / this.mltOutTempScaling) + this.mltOutTempOffset))) / 10;
      }
    });
  }

  _updateParameters() {
    this.valveHysteresis = this.parameterController.getValue(HE_HW_IN_HYST);
    this.valveScaling = this.parameterController.getValue(VALVE_SCALING);
    this.valveOffset = this.parameterController.getValue(VALVE_OFFSET);
    this.interval = this.parameterController.getValue(HE_HW_IN_Interval);
    this.mltOutTempScaling = this.parameterController.getValue(MLTOUTTEMP_SCALING);
    this.mltOutTempOffset = this.parameterController.getValue(MLTOUTTEMP_OFFSET);
  }

  _restartLoop() {
    logger.logInfo(this.moduleName, '_restartLoop', 'Restarting loop...');
    clearInterval(this.intervalRef);
    this.intervalRef = setInterval(() => this._checkPidMode(), this.interval);
  }
}


module.exports = new ValveControllerHeHwIn();
