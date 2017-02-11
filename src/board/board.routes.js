const router = require('express').Router();

const boardController = require('./board-controller').BoardController;

router.route('/').get((req, res) => {
  let pins = boardController.getPins();

  return res.send(pins);
});

router.route('/:name').post((req, res) => {
  req.check('name', 'Missing pin').notEmpty();
  req.checkBody('pinValue', 'Missing pinValue').notEmpty();
  req.checkBody('pinValue', 'Pin value must be an Integer').isInt();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) return res.status(400).send(result.array());

    let pinName = req.params.name;
    let value = req.body.pinValue;

    boardController.writePin(pinName, value, err => {
      if (err) return res.status(500).send(err.message);

      return res.send();
    });
  });
})

module.exports = router;
