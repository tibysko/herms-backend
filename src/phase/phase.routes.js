const router = require('express').Router();

const phaseController = require('./phase-controller');

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




module.exports = router;