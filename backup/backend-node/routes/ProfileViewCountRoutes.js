const express = require('express');
const router = express.Router();

const { store, getViewerCount } = require('../controller/ProfileViewCountController');

router.post('/store', store);
router.get('/getViewerCount/:profile_id', getViewerCount);

module.exports = router;