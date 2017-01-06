const router = require('express').Router();

const valveController = require('./valve-controller').ValveController;

router.route('/valves').get((req, res) => {
  res.send(valveController.getValves());
})

router.route('/valves/:name').post((req, res) => {
  let name = req.params.name;
  let body = req.body;

  if (body && body.state) {
    valveController.setState(name, body.state, function (err) {
      errorHandler(err, res);
    });
  } else {
    res.status(400).send({
      error: 'body not found'
    });
  }
});

module.exports = router;