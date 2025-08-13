const express = require('express');
const router = express.Router();

const { store, getViewerCount, getViewerIds } = require('../controller/ProfileViewCountController');

router.post('/store', store);
router.get('/getViewerCount/:profile_id', getViewerCount);
router.get('/getViewerIds/:profile_id', getViewerIds);

module.exports = router;