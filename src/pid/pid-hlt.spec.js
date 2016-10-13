'use strict'

var PidHlt = require('./pid-hlt');
var chai = require('chai');
const assert = require('chai').assert;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

describe('Pid HLT', function () {
    var pidHlt;
    var pins = {
        readPin: function () {},
        writePin: function () {}
    };

    beforeEach(function () {
        let setPoint = 10;
        let pidController = {

        }

        pins = {
            readPin: function () {},
            writePin: function () {}
        };

        pidHlt = new PidHlt(setPoint, pins);
    });

    afterEach(function () {
        pidHlt = {};
        pins = {};
    });

    // TODO need to find a proper way of testing start stop
    it('Test start & stop', function (done) {
        pidHlt.start();
        pidHlt.stop();

        done();
    });

    it('Heating', function () {    
        let expectedPower = 255;

        // create spies
        let setInput = sinon.spy(function (temp) {});
        let compute = sinon.spy(function () {});
        let getOutput = sinon.spy(function () {
            return expectedPower;
        });
        let writePin = sinon.spy(function () {});
        let emit = sinon.spy(function () {});

        // create fake parent
        let fakeParent = {
            actTemperatureValue: 10,
            pidController: {
                setInput: setInput,
                compute: compute,
                getOutput: getOutput
            },
            pins: {
                writePin: writePin
            },
            emit: emit
        };

        // Run heating
        pidHlt.heating(fakeParent);

        // Assert
        compute.should.have.been.calledOnce;
        let expectedTemperature = 10 / 4.7;
        setInput.should.have.been.calledWith(expectedTemperature);
        getOutput.should.have.been.calledOnce;
        compute.should.have.been.calledOnce;
        writePin.should.have.been.calledWith('HLT_HEATER', expectedPower);
        emit.should.have.been.calledWith('temperature', {'temperature': expectedTemperature});
    });
});