var express = require('express');
var router = express.Router();

var herms = require('./herms');
var logger = require('./core/logger');

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

router.route('/pid-controllers/:name').post((req, res) => {
  let body = req.body;
  let controllerName = req.params.name;

  if (body) {
    let config = body;
    herms.setPidController(controllerName, config);

    res.status(200).send(herms.getPidControllers());

  } else {
    res.status(400).send();
  }
});

router.route('/pid-controllers').get((req, res) => {
  let status = herms.getPidControllers();

  res.send(status);
});

router.route('/valves').get((req, res) => {
  res.send(herms.getValves());
})

router.route('/valves/:name').post((req, res) => {
  let name = req.params.name;
  let body = req.body;

  if (body && body.state) {
    herms.setValve(name, body.state, function (err) {
      errorHandler(err, res);
    });
  } else {
    res.status(400).send({
      error: 'body not found'
    });
  }
});

router.route('/status').get((req, res) => {
  res.send(herms.getStatus());
});

router.route('/logs/error').get((req, res) => {
  logger.readLogs((results) => {
    res.send(results);
  })
});

router.route('/phases').get((req, res) => {
  res.send(herms.getPhases());
});

router.route('/phases/:id/activate').put((req, res) => {
  let id = req.params.id;

  let phase = herms.activatePhase(id);

  if (phase instanceof Error) {
    res.status(400).send(phase.message);
  } else {
    return res.send(phase);
  }
});

router.route('/phases/:id').put((req, res) => {
  let phase = req.body;
  let phaseId = req.params.id;

  if (!phase) {
    res.status(400).send('Missing phase on body');
  } else {
    let updatedPhase = herms.updatePhase(phaseId, phase);

    if (updatedPhase instanceof Error) {
      res.status(500).send(updatedPhase.message);
    } else {
      res.send(updatedPhase);
    }
  }
});

router.route('/phases/:id').delete((req, res) => {
  let phaseId = req.params.id;

  if (!phaseId) {
    res.status(400).send({
      error: 'missing phaseId'
    });
  } else {
    let deletedId = herms.deletePhase(phaseId);

    if (deletedId instanceof Error) {
      res.status(500).send({
        error: deletedId.message
      });
    } else {
      res.send(deletedId);
    }
  }
});

router.route('/phases').post((req, res) => {
  let phase = req.body;

  if (!phase) {
    res.status(400).send({
      'error': 'missing body'
    });

  } else {
    let newPhase = herms.createPhase(phase);

    if (newPhase instanceof Error) {
      res.status(400).send(newPhase.message);
    } else {
      return res.send(newPhase);
    }
  }
});

router.route('/parameters/:name').put((req, res) => {
  let body = req.body;
  let name = req.params.name;

  if (!body || !body.value || !name) {
    res.status(400).send({
      error: 'missing body/value or parameter name'
    });
  } else {
    let parameterValue = body.value;
    let updatedParameters = herms.updateParameter(name, parameterValue);

    if (updatedParameters instanceof Error) {
      res.status(500).send(updatedParameters.message);
    } else {
      res.send(updatedParameters);
    }
  }
});

router.route('/parameters').get((req, res) => {
  res.send(herms.getParameters());
});


function errorHandler(err, res) {
  if (err) {
    res.status(400).send({
      'error': err.toString()
    });
  } else {
    res.send();
  }
}

module.exports = router;
