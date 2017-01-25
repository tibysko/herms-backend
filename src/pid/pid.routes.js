const router = require('express').Router();
const pidControllerRegistry = require('./pid-controller-registry');

router.route('/:name').post((req, res) => {
  req.check('name', 'Name must exists').notEmpty();
  req.checkBody('kp', 'Kp is missing').notEmpty();
  req.checkBody('ki', 'Ki is missing').notEmpty();
  req.checkBody('kd', 'Kd is missing').notEmpty();
  req.checkBody('mode', 'mode is missing').notEmpty();
  req.checkBody('output', 'Output is missing').notEmpty();
  req.checkBody('setPoint', 'Setpoint is missing').notEmpty();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) return res.status(400).send(result.array());

    let config = req.body;
    let controllerName = req.params.name;

    try {
      pidControllerRegistry.setPidController(controllerName, config);
      return res.status(200).send(pidControllerRegistry.getPidControllerStatus());

    } catch (err) {
      return res.status(500).send(err.message);
    }
  });
});

router.route('/').get((req, res) => {
  res.send(pidControllerRegistry.getPidControllerStatus());
});

module.exports = router;
