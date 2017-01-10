const router = require('express').Router();
const pidControllerRegistry = require('./pid-controller-registry');

router.route('/:name').post((req, res) => {
  let body = req.body;
  let controllerName = req.params.name;

  if (body) {
    let config = body;
    pidControllerRegistry.setPidController(controllerName, config);

    res.status(200).send(pidControllerRegistry.getPidControllerStatus());

  } else {
    res.status(400).send();
  }
});

router.route('/').get((req, res) => {
  let status = pidControllerRegistry.getPidControllerStatus();

  res.send(status);
});

module.exports = router;