const express = require('express');

const router = express.Router();


const { list, store, update, unique, emailUnique, phUnique } = require('../controller/CompanyController');

router.get('/list', list);
router.post('/store', store);
router.post('/update', update);
router.post('/regNoUnique', unique);
router.post('/emailUnique', emailUnique);
router.post('/phUnique', phUnique);

module.exports = router;