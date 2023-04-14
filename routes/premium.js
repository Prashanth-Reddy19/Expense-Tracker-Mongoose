const express = require('express');

const premiumController = require('../controller/premium')

const authenticatemiddleware = require('../middleware/auth')

const router = express.Router();


router.get('/premium/showLeaderBoard', authenticatemiddleware.authenticate, premiumController.getUserLeaderBoard);

module.exports = router;