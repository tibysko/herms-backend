const router = require('express').Router();

const parameterController = require('./parameter-controller');

router.route('/:name').put((req, res) => {
  req.check('name', 'Missin name').notEmpty();
  req.checkBody('value', 'Missing value').notEmpty();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) return res.status(400).send(result.array());

    let parameterValue = req.body.value;
    let name = req.params.name;

    try {
      let updatedParameters = parameterController.updateParameter(name, parameterValue);

      return res.send(updatedParameters);
    } catch (err) {
      return res.status(500).send(err.message);
    }

  });
});

router.route('/').get((req, res) => {
  res.send(parameterController.getParameters());
});

module.exports = router;
