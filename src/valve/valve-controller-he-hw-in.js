const boardController = require('../board/board-controller').BoardController;
const parameterController = require('../parameters/parameter-controller');
const pidController = require('../pid/mlt-pid-controller');
const ValveConstants = require('./valve-controller').ValveContants;
const valveController = require('./valve-controller').ValveController;

const HYSTERESIS = 'HE_HW_IN_Hysteresis';
const VALVE_STEP = 'HE_HW_IN_Step';
const INTERVAL = 'HE_HW_IN_Interval';

class ValveControllerHeHwIn {

  constructor() {
    this.boardController = boardController;
    this.parameterController = parameterController;
    this.pidController = pidController;
    this.valveController = valveController;

    this.output = 0;
    this.temperature = 0;
    this.valveHysteresis = 5;
    this.valveStep = 25;
    this.valveSetPoint = 0;
    this.valveActPos = 0;
    this.tempMode = '';

    this._updateParameters();
    this._setupListeners();

    setInterval(() => this._computeValvePos(), INTERVAL);
  }

  _computeValvePos() {
    if (this.tempMode !== this.pidController.getMode()) {
      this.tempMode = this.pidController.getMode();
      this.valveController.setState('HE_HW_IN', ValveConstants.STOP_CLOSE, function () {});
      this.valveController.setState('HE_HW_IN', ValveConstants.STOP_OPEN, function () {});
    }

    if (this.pidController.getMode().toLowerCase() === 'auto') {

      if (Math.abs(this.output - this.valveSetPoint) > this.valveStep || this.output >= 100) {
        this.valveSetPoint = this.output;
      }

      if (Math.abs(this.valveActPos - this.valveSetPoint) > this.valveHysteresis) {
        if (this.valveActPos > this.valveSetPoint) {
          this.valveController.setState('HE_HW_IN', ValveConstants.START_CLOSE, function () {});
        } else {
          this.valveController.setState('HE_HW_IN', ValveConstants.START_OPEN, function () {});
        }
      } else {
        this.valveController.setState('HE_HW_IN', ValveConstants.STOP_CLOSE, function () {});
        this.valveController.setState('HE_HW_IN', ValveConstants.STOP_OPEN, function () {});
      }
    }
  }

  _setupListeners() {
    this.parameterController.on('data', () => {
      this._updateParameters();
    });

    this.pidController.on('data', (data) => {
      this.output = data.output;
      this.temperature = data.temperature;
    });

    this.boardController.on('data', (data) => {
      if (data['HE_HW_IN_ACTPOS']) {
        this.valveActPos = data['HE_HW_IN_ACTPOS'].value;
      }
    });
  }

  _updateParameters() {
    let valveHysteresis = this.parameterController.getValue(HYSTERESIS);
    let valveStep = this.parameterController.getValue(VALVE_STEP);

    this.valveHysteresis = parseFloat(valveHysteresis);
    this.valveStep = parseFloat(valveStep);
  }
}

module.exports = new ValveControllerHeHwIn();
