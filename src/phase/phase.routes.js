const router = require('express').Router();

const phaseController = require('./phase-controller');

router.route('/').get((req, res) => {
  res.send(phaseController.getPhases());
});

router.route('/:id/activate').put((req, res) => {
  req.check('id', 'Missing id').notEmpty();

  req.getValidationResult().then(result => {
    if (!result.isEmpty) return res.status(400).send(result.array());

    let id = req.params.id;

    try {
      let phase = phaseController.activatePhase(id);

      return res.send(phase);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });
});

router.route('/:id').put((req, res) => {
  req.check('id', 'Missing id');
  req.checkBody('name', 'Missing name').notEmpty();
  req.checkBody('valves', 'Missing valves and must be an array').notEmpty().isArray();;

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) return res.status(400).send(result.array());

    let phase = req.body;
    let phaseId = req.params.id

    try {
      let updatedPhase = phaseController.updatePhase(phaseId, phase);
      res.send(updatedPhase);
    } catch (err) {

      return res.status(500).send(err.message);
    }
  });
});

router.route('/:id').delete((req, res) => {
  req.check('id', 'Missing id').notEmpty();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) return res.status(400).send(result.array());

    let phaseId = req.params.id;

    try {
      let deletedId = phaseController.deletePhase(phaseId);

      return res.send(deletedId);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });
});

router.route('/').post((req, res) => {
  req.checkBody('name', 'Missing name').notEmpty();
  req.checkBody('valves', 'Missing valves or it is not an annary').notEmpty().isArray();

  req.getValidationResult().then(result => {
    if (!result.isEmpty) return res.status(400).send(result.array());

    let phase = req.body;

    try {
      let newPhase = phaseController.createPhase(phase);
      return res.send(newPhase);

    } catch (err) {
      return res.status(400).send(err.message);
    }
  });
});

module.exports = router;
