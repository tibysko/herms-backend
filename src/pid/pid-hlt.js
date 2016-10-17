'use strict';

const EventEmitter = require('events');

var logger = require('../core/logger');
var PID = require('./pid-controller');

class PidHLT extends EventEmitter {

    constructor(board) {
        super(); // EventEmitter constructor 

        this.actTemperatureValue = 0;
        this.board = board;
        this.dummyId = -10; // dummy value
        this.process = this.dummyId;
        this.moduleName = 'pidHLT'; // TODO: another way to get class name?

        // pidController        
        this.Kp = 300;
        this.Ki = 100;
        this.Kd = 50;
        this.pidController = {};
        this.setPoint = 0;
        this.timeframe = 1000;
    }

    start() {
        if (this.process !== this.dummyId) {
            logger.logInfo(this.moduleName, 'start', 'Already started');
            return;
        }

        logger.logInfo(this.moduleName, 'start', 'Starting with settings: Kp=' + this.Kp + ' Ki=' + this.Ki + ' Kd=' + this.Kd + ' setPoint=' + this.setPoint);

        this.board.on('data', (data) => {
            this.actTemperatureValue = data['T1_HLT'].value;
        });

        this.pidController = new PID(this.actTemperatureValue, this.setPoint, this.Kp, this.Ki, this.Kd, 'direct');

        this.pidController.setSampleTime(this.timeframe);
        this.pidController.setOutputLimits(0, 255);
        this.pidController.setMode('automatic');

        logger.logInfo(this.moduleName, 'start', 'Starting intervall...');

        this.process = setInterval(() => {
            let currTemp = this.actTemperatureValue / 4.7;

            this.pidController.setInput(currTemp);
            this.pidController.compute();
            let output = this.pidController.getOutput();

            this.board.writePin('HLT_HEATER', output, function () {});

            this.emit('data', {
                output: output,
                temperature: currTemp
            });

        }, this.timeframe);
    }

    stop() {
        logger.logInfo(this.moduleName, 'start', 'Stopping pid ...');

        clearInterval(this.process);
    }

    setSetPoint(value) {
        logger.logInfo(this.moduleName, 'setOutput', 'Setting setPoint: ' + value);

        this.pidController.setPoint(value);
    }

    setOutput(value) {
        logger.logInfo(this.moduleName, 'setOutput', 'Setting output: ' + value);

        this.pidController.setOutput(value);
    }

    setMode(mode) {
        logger.logInfo(this.moduleName, 'setMode', 'Setting mode: ' + mode);
        console.log(JSON.stringify(this.pidController));
        this.pidController.setMode(mode);
    }

    setTunings(Kp, Ki, Kd) {
        this.pidController.setTunings(Kp, Ki, Kd);
        logger.logInfo(this.moduleName, 'setTunings', 'Setting tunings: Kp=' + Kp + ' Ki=' + Ki + ' Kd=' + Kd);
    }

    getStatus(){
        let status = {
            kp: this.pidController.getKp(),
            ki: this.pidController.getKi(),
            kd: this.pidController.getKd(),
            mode: this.pidController.getMode(),
            output: this.pidController.getOutput(),
            setPoint: this.pidController.getSetPoint()
        }

        return status;
    }

}

module.exports = PidHLT;