const express = require('express');

const router = express.Router();


const { list, store, update, unique } = require('../controller/CompanyController');

router.get('/list', list);
router.post('/store', store);
router.post('/update', update);
router.post('/RegNounique', unique);

module.exports = router;