const router = require('express').Router();

const boardController = require('./board-controller').BoardController;

router.route('/').get((req, res) => {
  let pins = boardController.getPins();

  return res.send(pins);
});

router.route('/:name').post((req, res) => {
  let pinName = req.params.name;
  let value = req.body.pinValue;

  boardController.writePin(pinName, value, (err) => {
    if (err) {
      res.status(400).send({
        error: err.message
      });
    } else {
      res.send({
        pin: pinName,
        value: value
      });
    }
  });
});

module.exports = router;