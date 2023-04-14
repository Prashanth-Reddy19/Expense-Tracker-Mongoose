const express = require('express');

const resetpasswordController = require('../controller/resetpassword');


const router = express.Router();

router.get('/password/updatepassword/:resetpasswordid', resetpasswordController.updatepassword)

router.get('/password/resetpassword/:id', resetpasswordController.resetpassword)

router.use('/password/forgotpassword', resetpasswordController.forgotpassword)

module.exports = router;