const ValveConstants = require('./valve-constants');
const parameterController = require('../parameters/parameter-controller');

class ValveControllerHeHwIn {

  constructor(pidController, valveController, board) {
    this.pidController = pidController;
    this.valveController = valveController;
    this.board = board;
    this.pidControllerName = '';
    this.output = 0;
    this.temperature = 0;
    this.valveHysteresis = 5;
    this.valveStep = 25;
    this.valveSetPoint = 0;
    this.valveActPos = 0; // todo get value from board
    this.tempMode = '';

    parameterController.on('data', (data) => {
        console.log('valveStep: ' + data.valveStep);
    });

    this.pidController.on('data', (data) => {
      this.pidControllerName = data.name;
      this.output = data.output;
      this.temperature = data.temperature;
    });

    this.board.on('data', (data) => {
      if (data['HE_HW_IN_ACTPOS']) {
        this.valveActPos = data['HE_HW_IN_ACTPOS'].value;
      }

      this.computeValvePos();
    });
  }

  computeValvePos() {
    if (this.tempMode !== this.pidController.getMode()) {
      this.tempMode = this.pidController.getMode();
      this.valveController.setState('HE_HW_IN', ValveConstants.STOP_CLOSE, function () {});
      this.valveController.setState('HE_HW_IN', ValveConstants.STOP_OPEN, function () {});
      console.log('tempmpde run once');
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
}

module.exports = ValveControllerHeHwIn;
