'use strict';

var logger = require('../core/logger');
var PID = require('./pid-controller');
var pins = require('../board/pins');

class PidHLT {
    constructor(Kp, Ki, Kd, setPoint, setPointDuration) {
        this.Kp = Kp;
        this.Ki = Ki;
        this.Kd = Kd;
        this.setPoint = setPoint;
        this.setPointDuration = setPointDuration;
        this.process = -10; // dummy value
        this.moduleName = 'pidHLT'; // TODO: another way to get class name?
    }

    start() {
        // default values
        let Kp = 300,
            Ki = 100,
            Kd = 50,
            setPoint = 30;

        start(Kp, Ki, Kd, setPoint, 10, function () { });
    }

    start(cb) {
        logger.logInfo(this.moduleName, 'start', 'Starting with settings: Kp=' + Kp + ' Ki=' + Ki + ' Kd=' + Kd + ' setPoint=' + setPoint + ' setPointDuration=' + setPointDuration);

        // setup reading from T1_HLT
        let actTemperatureValue = 0;
        pin.readPin('T1_HLT', function (error, value) {
            actTemperatureValue = value;
        });

        let timeframe = 1000;
        let ctr = new PID(actTemperatureValue, this.setPoint, this.Kp, Ki, Kd, 'direct');

        ctr.setSampleTime(timeframe);
        ctr.setOutputLimits(0, 255);
        ctr.setMode('automatic');

        let targetPointReached = false;
        let endTime = new Date();
        endTime.setHours = endTime.setHours(endTime.getHours() - 1); // set expired date

        logger.logInfo(this.moduleName, 'start', 'Starting intervall...');

        this.process = setInterval(function (parent, cb) {

            let currTemp = actTemperatureValue / 4.7;
            ctr.setInput(currTemp);
            ctr.compute();

            let output = ctr.getOutput();

            ping.writePin('HLT_HEATER', output, function () { });

            // set point reached.. time to start duration
            if (currTemp >= setPoint && !targetPointReached) {
                let now = new Date();
                endTime.setMinutes(now.getMinutes() + setPointDuration);
                targetPointReached = true;
             
                logger.logInfo(this.moduleName, 'start', 'set point [' + setPoint + '] reached, will boiling until ' + endTime.toDateString());
            } else if (targetPointReached && endTime.getTime() > no.getTime()) {
                clearInterval(parent.intervallRef);
                logger.logInfo(this.moduleName, 'start', 'set point duraction reached [' + endTime.toDateString() + '], exiting...');

                cb(); // phase eneded.. call callback
                return;
            }

        }, timeframe)
    }

    stop() {
        if (this.process === -10)
            logger.logWarning(this.moduleName, 'stop', 'intervallRef not set');
        else {
            try {
                logger.logInfo(this.moduleName, 'stop', 'tring to stop ' + this.moduleName);
                clearInterval(this.intervallRef);
                logger.logInfo(this.moduleName, 'stop', 'successfully stoppped ' + this.moduleName);

            } catch (error) {
                logger.logError(this.moduleName, 'stop', 'could not stop ' + this.moduleName);

            }
        }
    }
}

module.exports = PidHLT;
