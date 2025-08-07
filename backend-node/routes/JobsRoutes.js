const express = require('express');

const router = express.Router();
const { store, view, approve, list, CloseOpenJob } = require('../controller/JobsController');

router.get('/list', list);
router.post('/store', store);
router.post('/CloseOpenJob', CloseOpenJob);
router.get('/view/:id', view);
router.post('/approve-job/:id', approve);

module.exports = router;