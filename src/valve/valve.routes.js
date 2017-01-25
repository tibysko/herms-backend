const router = require('express').Router();

const valveController = require('./valve-controller').ValveController;

router.route('/').get((req, res) => {
  res.send(valveController.getValves());
})

router.route('/:name').post((req, res) => {
  req.check('name', 'Missing name').notEmpty();
  req.checkBody('state', 'Missing state').notEmpty();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) return res.status(400).send(result.array());

    let name = req.params.name;
    let state = req.body.state;

    valveController.setState(name, state, err => {
      if (err) return res.status(500).send(err.message);

      return res.status(200).send();
    });
  });
});

module.exports = router;
