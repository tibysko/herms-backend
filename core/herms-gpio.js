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

        logger.logInfo('Initiating Board');

        this.board.on('ready', () => this.setupPins());

    }

    setupPins() {
        logger.logInfo('HermsGpio.setupPins', 'Setting up pins');

        lodash.map(this.pins, (pinMetaData, pinName) => {

            if (pinMetaData.board === 'raspberry') {
                let direction = pinMetaData.direction === 'out' ? gpio.DIR_OUT : GPIO.DIR_IN;

                gpio.setup(pinMetaData.id, direction, function (err) {
                    if (err) {
                        logger.logError('HermsGpio.setupPins', 'Setup for pin ' + pinName + ' failed on board ' + pinMetaData.board);
                        throw err;
                    }

                    logger.logInfo('HermsGpio.setupPins', 'Succesfully setup pin ' + pinName + ' on ' + pinMetaData.board);

                });
            } else if (pinMetaData.board === 'arduino') {
                this.pins[pinName].physcialPin = new five.Pin(pinMetaData.id, {value: pinMetaData.initValue}); //, { board: this.board });                               
            }
        });
    }

    readPin(pinName, cb) {
        if (!this.isPinRegistered) {
            logErrorAndExecuteCallBack('readPin', 'Pin ' + pinName + ' not found', cb);
            return;
        }

        let pin = pins[pinName];

        if (pin.direction !== 'out') {
            logErrorAndExecuteCallBack('readPin', 'Pin ' + pinName + ' not setup for IN', cb);
            return;
        }

        if (pin.board === 'arduino') {
            new five.Pin(pin.id).read(function (error, value) {
                cb(value);
            });
        } else if (pin.board === 'raspberry') {
            // TODO ?
        }
    }

    logErrorAndExecuteCallBack(functionName, errorMessage, cb) {
        logger.logError('HermsGpio.' + functionName, errorMessage);
        cb(new Error(errorMessage));
    }

    isPinRegistered(pinName) {
        return this.pins[pinName] ? true : false;
    }

    writeToPin(pinName, value, cb) {
        let pins = this.pins;

        if (!this.isPinRegistered(pinName)) {
            let errorMessage = 'Pin ' + pinName + ' not found'
            logger.logError('HermsGpio.writeToPin', errorMessage);

            cb(new Error(errorMessage));
            return;
        }

        let pin = pins[pinName];

        if (pin.direction !== 'in') {
            let errorMessage = 'Pin ' + pinName + ' not configured as IN';

            logger.logError('HermsGpio.writeToPin', errorMessage)
            cb(new Error(errorMessage));
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
            //HermsGpio.logSuccessfully(pinName, value, pin);
            cb(); // successfully written to pin, call callback     
        }
    }

    static logSuccessfully(pinName, value, pin) {
        logger.logInfo('HermsGpio.writeToPin', 'Wrote ' + value + ' to pin ' + pinName + ' on board ' + pin.board);
    }

}

module.exports = HermsGpio;