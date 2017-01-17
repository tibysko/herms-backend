const router = require('express').Router();

const parameterController = require('./parameter-controller');

router.route('/parameters/:name').put((req, res) => {
  let body = req.body;
  let name = req.params.name;

  if (!body || !body.value || !name) {
    res.status(400).send({
      error: 'missing body/value or parameter name'
    });
  } else {
    let parameterValue = body.value;
    let updatedParameters = parameterController.updateParameter(name, parameterValue);

    if (updatedParameters instanceof Error) {
      res.status(500).send(updatedParameters.message);
    } else {
      res.send(updatedParameters);
    }
  }
});

router.route('/parameters').get((req, res) => {
  res.send(parameterController.getParameters());
});

module.exports = router;