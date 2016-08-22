'use strict';

var PID = require('./pid-controller');
var logger = require('./logger');

class PidHLT {

    start(board) {
        let Kp = 300,
            Ki = 100,
            Kd = 50;

        let setPoint = 30;
        let actTemperatureValue = 0;
        let timeframe = 1000;
        let ctr = new PID(actTemperatureValue, setPoint, Kp, Ki, Kd, 'direct');

        ctr.setSampleTime(timeframe);
        ctr.setOutputLimits(0, 255);
        ctr.setMode('automatic');

        setInterval(function (parent) {
            board.readPin('T1_HLT', function (error, value) {
                actTemperatureValue = value;
            });

            let temperature = actTemperatureValue / 4.7;
            ctr.setInput(temperature);
            ctr.compute();

            let output = ctr.getOutput();

            board.writePin('HLT_HEATER', output, function() {});

            console.log("PWM: " + output + " temp: " + temperature);

        }, timeframe)
    }
}

module.exports = PidHLT;
