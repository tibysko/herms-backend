"use strict"

//var five = require('johnny-five');
var logger = require('./logger');
var gpio = require('rpi-gpio');
var fs = require('fs');
var lodash = require('lodash');

class HermsGpio {

    constructor() {
        this.pins = JSON.parse(fs.readFileSync("./config/pins.json"));
        /*  this.boardInitiated = false;
          var Board = five.Board;
          var board = new Board({
              repl: false
          });        
  
          logger.logInfo('Initiating Board');
  
          board.on('ready', function () {
              logger.logInfo('Board initiated');
          });*/

          this.setupPins();
    }

    setupPins() {

        lodash.map(this.pins, function (pinMetaData, pinName) {
            if (pinMetaData.board === 'raspberry') {
                var direction = pinMetaData.direction === 'out' ? gpio.DIR_OUT : GPIO.DIR_IN;

                gpio.setup(pinMetaData.id, direction, function (err) {
                    if (err) {
                        logger.logError('HermsGpio.setupPins', 'Setup for pin ' + pinName + ' failed on board ' + pinMetaData.board);
                        throw err;
                    }

                    logger.logInfo('HermsGpio.setupPins', 'Succesfully setup pin ' + pinName + ' on ' + pinMetaData.board);

                });
            } else if (pin.board === 'arduino') {
                logger.logInfo('HermsGpio.setupPins', 'Succesfully setup pin ' + pinName + ' on ' + pinMetaData.board);
            }
        });
    }

    writeToPin(pinName, value, callback) {
        var pins = this.pins;

        if (!pins[pinName]) {
            var errorMessage = 'Pin ' + pinName + ' not found'
            logger.logError('HermsGpio.writeToPin', errorMessage);
            
            callback(new Error(errorMessage));
        }

        var pin = pins[pinName];

        if (pin.board === 'raspberry') {
            gpio.write(pin.id, value, function(err){
                if(err) {
                    var errorMessage = 'Error writing to pin ' + pinName + '. Error: ' + err.message;
                    logger.logError('HermsGpio.writeToPin', errorMessage);
                    callback(new Error(errorMessage));
                
                    return;
                }

                HermsGpio.logSuccessfully(pinName, value, pin); 
                callback(); // successfully written to pin, call callback                
            }); 
        } else if (pin.board === 'arduino') {
            HermsGpio.logSuccessfully(pinName, value, pin);
        }
    }

    static logSuccessfully(pinName, value, pin){
        logger.logInfo('HermsGpio.writeToPin', 'Wrote ' + value + ' to pin ' + pinName + ' on board ' + pin.board);
    }
    
}

module.exports = HermsGpio;