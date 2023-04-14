const express = require('express');

const expenseController = require('../controller/expense')
const userAuthentication = require('../middleware/auth')

const router = express.Router();



router.post('/expense/add-expense', userAuthentication.authenticate, expenseController.addExpense);

router.get('/expense/get-expenses', userAuthentication.authenticate, expenseController.getExpenses);

router.delete('/expense/delete-expense/:id', userAuthentication.authenticate, expenseController.deleteExpense);

router.get('/expense/download', userAuthentication.authenticate, expenseController.downloadExpense)

router.get('/expense/downloadedfiles', userAuthentication.authenticate, expenseController.downlodedExpense);

module.exports = router