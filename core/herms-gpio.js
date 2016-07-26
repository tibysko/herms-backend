"use strict"

var five = require('johnny-five');
var logger = require('./logger');
var gpio = require('rpi-gpio');
var fs = require('fs');
var lodash = require('lodash');

class HermsGpio {

    constructor() {
        this.pins = JSON.parse(fs.readFileSync("./config/pins.json"));

        var Board = five.Board;
        this.board = new Board({
            repl: false
        });

        logger.logInfo('HermsGpio.constructor', 'Initiating Board');

        this.board.on('ready', () => this.setupPins());

    }

    setupPins() {
        logger.logInfo('HermsGpio.setupPins', 'Setting up pins');

        lodash.map(this.pins, (pinMetaData, pinName) => {
            logger.logInfo('HermsGpio.setupPins', 'Setting up pin: ' + pinName + ' with setting: ' + JSON.stringify(pinMetaData));

            if (pinMetaData.board === 'raspberry') {
                let mode = pinMetaData.mode === 'out' ? gpio.DIR_OUT : GPIO.DIR_IN;

                gpio.setup(pinMetaData.id, mode, function (err) {
                    if (err) {
                        logger.logError('HermsGpio.setupPins', 'Setup for pin ' + pinName + ' failed on board ' + pinMetaData.board);
                        throw err;
                    }

                    logger.logInfo('HermsGpio.setupPins', 'Succesfully setup pin ' + pinName + ' on ' + pinMetaData.board);

                });
            } else if (pinMetaData.board === 'arduino') {
                let mode = pinMetaData.mode === 'in' ? five.Pin.INPUT : five.Pin.OUTPUT;
                this.pins[pinName].physcialPin = new five.Pin({ 'pin': pinMetaData.id, 'mode': mode }); //, { board: this.board });value: pinMetaData.initValue,                               
            }
        });
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

        if (pin.board === 'arduino') {            
            pin.physcialPin.query(function (state) {
                logger.logInfo('HermsGpio.readPin', 'Pin: ' + pinName + ' Id: ' + pin.id + ' value: ' + state.value);
                cb(null, state); // null = no error                
            });

            /*      pin.physcialPin.read(function(error, value) {
         console.log(value);
       });*/
        } else if (pin.board === 'raspberry') {
            // TODO ?
        }
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
            let errorMessage = 'Pin ' + pinName + ' not found'
            logger.logError('HermsGpio.writeToPin', errorMessage);

            cb(new Error(errorMessage));
            return;
        }

        let pin = pins[pinName];

        if (pin.mode !== 'out') {
            let errorMessage = 'Pin ' + pinName + ' not configured as OUT';

            logger.logError('HermsGpio.writeToPin', errorMessage)
            cb(new Error(errorMessage));
            return;
        }

        if (pin.board === 'raspberry') {
            gpio.write(pin.id, value, function (err) {
                if (err) {
                    let errorMessage = 'Error writing to pin ' + pinName + '. Error: ' + err.message;
                    logger.logError('HermsGpio.writeToPin', errorMessage);
                    cb(new Error(errorMessage));

                    return;
                }

                HermsGpio.logSuccessfully(pinName, value, pin);
                cb(); // successfully written to pin, call callback                
            });
        } else if (pin.board === 'arduino') {
            let options = {
                // TODO stuff here
            }

            pin.physcialPin.write(value);
            HermsGpio.logSuccessfully(pinName, value, pin);
            cb(); // successfully written to pin, call callback     
        }
    }

    static logSuccessfully(pinName, value, pin) {
        logger.logInfo('HermsGpio.writeToPin', 'Wrote ' + value + ' to pin ' + pinName + ' on board ' + pin.board);
    }

}

module.exports = HermsGpio;