var express = require('express');
var router = express.Router();

var herms = require('./herms');
var logger = require('./core/logger');

router.route('/pins').get((req, res) => {
    let pins = herms.getPins();

    return res.send(pins);
});

router.route('/pins/:name').post((req, res) => {
    let pinName = req.params.name;
    let value = req.body.pinValue;

    herms.writePin(pinName, value, (err) => {
        if (err) {
            res.status(400).send({
                'error': err.message
            });
        } else {
            res.send({
                'pin': pinName,
                'value': value
            });
        }
    });
});

router.route('/pid-controllers/:name').post((req, res) => {
    let body = req.body;
    let controllerName = req.params.name;

    if (body) {
        let config = body;
        herms.setPidController(controllerName, config);

        res.status(200).send(herms.getPidControllers());

    } else {
        res.status(400).send();
    }
});

router.route('/pid-controllers').get((req, res) => {
    let status = herms.getPidControllers();

    res.send(status);
});

router.route('/valves/:name').post((req, res) => {
    let name = req.params.name;
    let body = req.body;

    if (body && body.state) {
        herms.setValve(name, body.state, function (err) {
            errorHandler(err, res);
        });

    } else {
        res.status(400).send({
            error: 'body not found'
        });
    }
});

router.route('/status').get((req, res) => {
    res.send(herms.getStatus());
});

router.route('/logs/error').get((req,res) => {
    logger.readLogs((results) => {
        res.send(results);
    })
})

function errorHandler(err, res) {
    if (err) {
        res.status(400).send({
            'error': err.message
        });
    } else {
        res.send();
    }
}

module.exports = router;