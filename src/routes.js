var express = require('express');
var router = express.Router();

// Start Herms. A bit ugly to do it in routes.config. Want to start it in server.js
const Herms = new require('./herms');
var herms = new Herms();
herms.start();

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

router.route('/api/pid-controller').post((req, res) => {
    let body = req.body;

    if (body) {
        let config = body;
        herms.setPidController(config);

        res.status(200).send(herms.getPidController());

    } else {
        res.status(400).send();
    }
});

router.route('/api/pid-controller').get((req, res) => {
    let status = herms.getPidController();

    res.send(status);
});

module.exports = router;