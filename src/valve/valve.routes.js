const router = require('express').Router();

const valveController = require('./valve-controller').ValveController;

router.route('/').get((req, res) => {
  res.send(valveController.getValves());
})

router.route('/:name').post((req, res) => {
  let name = req.params.name;
  let body = req.body;

  if (body && body.state) {
    valveController.setState(name, body.state, function (err) {
      if(err){
        return res.status(400).send(err.message);
      }

      return res.status(200).send();
    });
  } else {
    res.status(400).send({
      error: 'body not found'
    });
  }
});

module.exports = router;