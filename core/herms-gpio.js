﻿"use strict"

var five = require('johnny-five');
var logger = require('./logger');
var fs = require('fs');
var lodash = require('lodash');

class HermsGpio {

    setup() {
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
            if (pinMetaData.board === 'raspberry') {
                logger.logWarning('HermsGpio.setupPins', 'raspberry currently not supported, pin:' + pinName + ' was not setup');
            } else if (pinMetaData.board === 'arduino') {
                logger.logInfo('HermsGpio.setupPins', 'Arduino: setting up pin: ' + pinName + ' with setting: ' + JSON.stringify(pinMetaData));

                let mode = pinMetaData.mode === 'in' ? five.Pin.INPUT : five.Pin.OUTPUT;
                this.pins[pinName].physcialPin = new five.Pin({ 'pin': pinMetaData.id, 'mode': mode, value: pinMetaData.initValue });
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
                // TODO error handling. currently not supported by query()

                logger.logInfo('HermsGpio.readPin', 'Reading pin: ' + pinName + ' value ' + JSON.stringify(state));
                cb(null, state.value); // execute cb and return value, null = no error;
                return;
            });
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
            let errorMessage = 'Pin ' + pinName + ' not found';
            HermsGpio.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        }

        let pin = pins[pinName];

        if (pin.mode !== 'out') {
            let errorMessage = 'Pin ' + pinName + ' not configured as OUT';
            HermsGpio.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        }

        if (pin.board === 'raspberry') {
            /* gpio.write(pin.id, value, function (err) {
                 if (err) {
                     let errorMessage = 'Error writing to pin ' + pinName + '. Error: ' + err.message;
                     logErrorAndExecuteCallBack('writePin', errorMessage, cb);
 
                     return;
                 }
 
                 HermsGpio.logSuccessfully(pinName, value, pin);
                 cb(); // successfully written to pin, call callback                
             });*/

            let errorMessage = 'raspberry not supported';
            HermsGpio.logErrorAndExecuteCallBack('writePin', errorMessage, cb);

            return;
        } else if (pin.board === 'arduino') {
            let options = {
                // TODO which options
            }

            // Write to pin
            pin.physcialPin.write(value);

            HermsGpio.logSuccessfully(pinName, value, pin);
            cb(null); // successfully written to pin, call callback. Null = no error   

            return;
        }
    }

    static logSuccessfully(pinName, value, pin) {
        logger.logInfo('HermsGpio.writeToPin', 'Wrote ' + value + ' to pin ' + pinName + ' on board ' + pin.board);
    }
}

module.exports = HermsGpio;