const ValveConstants = require('./valve-constants');
const parameterController = require('../parameters/parameter-controller');

const L1_OFFSET = 'l1_offset';
const L1_SCALING = 'l1_scaling';
const SPARGEWATER = 'SpargeWater';

class levelControllerHlt {

  constructor(valveController, board) {

    this.valveController = valveController;
    this.board = board;
    this.actLevelHlt = 0;
    this.levelScaling = 1;
    this.levelOffset = 0;
    this.start = false; //Todo fix startbutton from gui
    this.auto = false; //Todo fix auto from gui
    this.startLevel = 0;
    this.valveClosed = 0;
    this.spargeActive = false;
    this.stateValve = 0;

    parameterController.on('data', (data) => {
      this.levelScaling = parseFloat(data[L1_SCALING].value);
      this.levelOffset = parseFloat(data[L1_OFFSET].value);
    });

    this.board.on('data', (data) => {
      if (data['L1_HLT']) {
        this.actLevelHlt = (data['L1_HLT'].value / this.levelScaling) + this.levelOffset;
      }
      if (data['MLT_HW_IN_CLOSED']) {
        this.valveClosed = data['MLT_HW_IN_CLOSED'].value;
      }

    });

    this.checkLevelHlt();
  }

  checkLevelHlt() {

    switch (this.stateValve) {
      // Manual mode
      case 0:
        this.spargeActive = false;

        if (this.auto) {
          this.stateValve = 100;
          break;
        }

      // Auto wait for start sparge
      case 100:
        if (this.start) {
          this.valveController.setState('MLT_HW_IN', ValveConstants.START_OPEN, function () { });
          this.startLevel = this.actLevelHlt;
          this.spargeActive = true;
          this.stateValve = 110;
          break;
        }

      // Sparge active
      case 110:
        // Go back to Manual mode
        if (!this.auto) {
          this.stateValve = 0;
          break;
          // Sparge done
        } else if ((this.startLevel - this.actLevelHlt) <= SPARGEWATER && this.startLevel > this.actLevelHlt) {
          this.valveController.setState('MLT_HW_IN', ValveConstants.START_CLOSE, function () { });
          this.spargeActive = false;
          this.stateValve = 120;
          break;
        }

      // Set alarm for sparge done
      case 120:
        // Todo Set alarm for sparge done
        this.stateValve = 0;
        break;

    }

  }
}

module.exports = levelControllerHlt;
