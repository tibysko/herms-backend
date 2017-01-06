const parameterController = require('../parameters/parameter-controller');
const PidController = require('./pid-controller');

const T2_OFFSET = 't2_offset';
const T2_SCALING = 't2_scaling';
const TEMPERATURE_PIN = 'T2_HE_WORT_OUT';


class HltPidController extends PidController{
  constructor() {
    let offset = parameterController.getValue(T2_OFFSET);
    let scaling = parameterController.getValue(T2_SCALING);

    super(T2_OFFSET, T2_SCALING, TEMPERATURE_PIN);
  }
}

module.exports = new HltPidController();