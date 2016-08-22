"use strict"

var five = require('johnny-five');
var logger = require('./logger');
var fs = require('fs');
const EventEmitter = require('events');

class HermsGpio extends EventEmitter {

    setup(cb) {
        this.pins = JSON.parse(fs.readFileSync("./config/pins.json"));

        var Board = five.Board;
        this.board = new Board({
            repl: false
        });

        logger.logInfo('HermsGpio.constructor', 'Initiating Board');
        this.board.on('ready', () => this.setupPins(cb));
    }

    setupPins(cb) {        
        logger.logInfo('HermsGpio.setupPins', 'Setting up pins');

        for (let key in this.pins) {
            if (this.pins.hasOwnProperty(key)) {
                let pinMetaData = this.pins[key];
                let pinName = key;                

                logger.logInfo('HermsGpio.setupPins', 'Setting up pin: ' + pinName + ' with setting: ' + JSON.stringify(pinMetaData));

                let config = {
                    'pin': pinMetaData.id,
                    'type': pinMetaData.type
                };

                let mode;

                if (pinMetaData.mode === 'in') {
                    mode = five.Pin.INPUT;
                    config.type = pinMetaData.type;
                } else if (pinMetaData.mode === 'out') {
                    mode = five.Pin.OUTPUT;
                    config.type = pinMetaData.type;
                } else if (pinMetaData.mode === 'pwm') {
                    mode = five.Pin.PWM;
                }
                // TODO add 'value': pinMetaData.initValue
                config.mode = mode;

                this.pins[pinName].physcialPin = new five.Pin(config);
            }
        }

        cb(null);
    }

    readPin(pinName, cb) {
        if (!this.isPinRegistered(pinName)) {
            HermsGpio.logErrorAndExecuteCallBack('readPin', 'Pin ' + pinName + ' not found', cb);
            return;
        }

        let pin = this.pins[pinName];

        if (pin.mode !== 'in') {
            HermsGpio.logErrorAndExecuteCallBack('readPin', 'Pin ' + pinName + ' not setup for IN', cb);
            return;
        }

        pin.physcialPin.query(function (state) {
            // TODO error handling. currently not supported by query()

            logger.logInfo('HermsGpio.readPin', 'Reading pin: ' + pinName + ' value ' + JSON.stringify(state));
            cb(null, state.value); // execute cb and return value, null = no error;
            return;
        });

    }

    static logErrorAndExecuteCallBack(functionName, errorMessage, cb) {
        logger.logError('HermsGpio.' + functionName, errorMessage);
        cb(new Error(errorMessage));
    }

    isPinRegistered(pinName) {
        return this.pins[pinName] ? true : false;
    }

    writePin(pinName, value, cb) {
        let pins = this.pins;

        if (!this.isPinRegistered(pinName)) {
            let errorMessage = 'Pin ' + pinName + ' not found';
            HermsGpio.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        }

        let pin = pins[pinName];

        if (!(pin.mode !== 'out' || pin.mode !== 'pwm')) {
            let errorMessage = 'Pin ' + pinName + ' not configured as OUT';
            HermsGpio.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        }

        // Write to pin
        pin.physcialPin.write(value);

        logger.logInfo('HermsGpio.writeToPin', 'Wrote ' + value + ' to pin ' + pinName);
        cb(null); // successfully written to pin, call callback. Null = no error   

        return;

    }

    getPins() {
        let pins = this.pins;
        let pinsToReturn = [];

        for (let key in pins) {
            if (pins.hasOwnProperty(key)) {

                let newPin = {
                    "name": key,
                    "type": pins[key].type,
                    "mode": pins[key].mode,
                    "id": pins[key].id,
                    "initValue": pins[key].initValue,
                    "comment": pins[key].comment
                }

                pinsToReturn.push(newPin);
            }
        }
        return pinsToReturn;
    }
}

module.exports = HermsGpio;