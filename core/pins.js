"use strict"

var five = require('johnny-five');
var logger = require('./logger');
var fs = require('fs');
var io = require('./socket-io');

class Pins {
    constructor() {
        this.className = 'Pins';
    }

    setup() {
        logger.logInfo(this.className, 'setup', 'Setting up pins');
        this.pins = JSON.parse(fs.readFileSync("./config/pins.json"));

        for (let key in this.pins) {
            if (this.pins.hasOwnProperty(key)) {
                let pinMetaData = this.pins[key];
                let pinName = key;

                logger.logInfo(this.className, 'setup', 'Setting up pin: ' + pinName + ' with setting: ' + JSON.stringify(pinMetaData));

                let config = {
                    'pin': pinMetaData.id,
                    'type': pinMetaData.type,
                    'value': pinMetaData.initValue
                };

                if (pinMetaData.mode === 'in') {
                    config.mode = five.Pin.INPUT;
                    config.freq = '250'; //emits data events every 250ms
                    config.id = pinName;

                    this.pins[pinName].physcialPin = new five.Sensor(config);

                    this.pins[pinName].physcialPin.on('change', function (data) {
                        console.log('id: ' + this.id + ' value: ' + data);
                        io.emit('pins', { pin: this.id, data: data });
                    });

                } else if (pinMetaData.mode === 'out') {
                    config.mode = five.Pin.OUTPUT;

                    this.pins[pinName].physcialPin = new five.Pin(config);

                } else if (pinMetaData.mode === 'pwm') {
                    config.mode = five.Pin.PWM;

                    this.pins[pinName].physcialPin = new five.Pin(config);
                }
            }
        }
    }

    readPin(pinName, cb) {
        if (!this.isPinRegistered(pinName)) {
            Pins.logErrorAndExecuteCallBack('readPin', 'Pin ' + pinName + ' not found', cb);

            return;
        }

        this.pins[pinName].physcialPin.on('change', cb());

    }

    readPinOnce(pinName, cb) {
        if (!this.isPinRegistered(pinName)) {
            Pins.logErrorAndExecuteCallBack('readPinOnce', 'Pin ' + pinName + ' not found', cb);

            return;
        }

        let pin = this.pins[pinName];

        if (pin.mode !== 'in') {
            Pins.logErrorAndExecuteCallBack('readPinOnce', 'Pin ' + pinName + ' not setup for IN', cb);

            return;
        }

        pin.physcialPin.query(function (state) {
            // TODO error handling. currently not supported by query()

            logger.logInfo(this.className, 'readPinOnce', 'Reading pin: ' + pinName + ' value ' + JSON.stringify(state));
            io.sockets.emit('pins', { pin: pinName, data: state.value });

            cb(null, state.value); // execute cb and return value, null = no error;

            return;
        });

    }

    static logErrorAndExecuteCallBack(functionName, errorMessage, cb) {
        logger.logError(this.className, functionName, errorMessage);
        cb(new Error(errorMessage));
    }

    isPinRegistered(pinName) {
        return this.pins[pinName] ? true : false;
    }

    writePin(pinName, value, cb) {
        let pins = this.pins;

        if (!this.isPinRegistered(pinName)) {
            let errorMessage = 'Pin ' + pinName + ' not found';
            Pins.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        }

        let pin = pins[pinName];

        if (!(pin.mode !== 'out' || pin.mode !== 'pwm')) {
            let errorMessage = 'Pin ' + pinName + ' not configured as OUT';
            Pins.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        }

        // Write to pin
        pin.physcialPin.write(value);

        logger.logInfo(this.className, 'writePin', 'Wrote ' + value + ' to pin ' + pinName);
        io.sockets.emit('pins', { pin: pinName, data: value });

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

module.exports = Pins;