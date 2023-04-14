const Expense = require('../models/expense');
const User = require('../models/users');
const Downloadfile = require('../models/downlodedfile')
const mongoose = require('mongoose')
const AWS = require('aws-sdk')

// About s3 bucket in aws

async function uploadToS3(data, filename) {

    const BUCKET_NAME = 'expensetrackerapp';
    const IAM_USER_KEY = 'AKIA5HPMSZA67KPMK64K';
    const IAM_USER_SCERET = 'MNeb+Qg1IRiQIuLdqyHVmnx//KiomJMcI7PsVT05';

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SCERET

    })


    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log('Something went wrong', err)
                reject(err)

            }
            else {
                console.log('success', s3response)
                resolve(s3response.Location);
            }

        })
    })
}

// Download Expenses 

exports.downloadExpense = async (req, res, next) => {
    try {
        const Expenses = await Expense.find({ userId: req.user._id });
        const stringifiedExpenses = JSON.stringify(Expenses);
        const userId = req.user._id;
        const fileName = `Expenses${userId}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        const downloadfile = new Downloadfile({ url: fileUrl, userId: req.user._id });
        await downloadfile.save();


        res.status(200).json({ fileUrl, success: true })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err, success: false });
    }
}

// Downloadedfiles Expenses

exports.downlodedExpense = async (req, res, next) => {
    try {
        const downlodedfiles = await Downloadfile.find({ userId: req.user._id }).limit(15);
        console.log(">>>>>here", downlodedfiles);
        res.status(200).json({ success: true, message: downlodedfiles })
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err })
    }
}


// Add Expenses

exports.addExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { expense, description, category } = req.body
        const response = new Expense({
            expense: expense,
            description: description,
            category: category,
            userId: req.user._id
        })
        await response.save({ session });

        const totalExpense = Number(req.user.totalexpenses) + Number(expense);

        const user = await User.findOne({ _id: req.user._id }).session(session);

        user.totalexpenses = totalExpense;
        await user.save({ session });

        await session.commitTransaction();

        res.status(201).json({ message: response, success: true, totalExpense: totalExpense });

    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        res.status(500).json({ message: "Something went wrong", success: false })
    } finally {
        session.endSession();
    }

}

// Get Expenses

exports.getExpenses = async (req, res, next) => {
    try {

        const page = +req.query.page || 1;
        const limit = +req.query.limit || 5;
        const totalExpense = req.user.totalexpenses;
        const total = await Expense.count({ userId: req.user._id });
        const response = await Expense.find({ userId: req.user._id }).
            skip((page - 1) * limit).
            limit(limit)

        res.status(200).json({
            message: response,
            success: true,
            currentpage: page,
            nextpage: page + 1,
            previouspage: page - 1,
            hasnextpage: limit * page < total.length,
            haspreviouspage: page > 1,
            totalExpense: totalExpense


        });
    }
    catch (err) {
        res.status(500).json({ message: err, success: false });
    }
}

//Delete Expenses

exports.deleteExpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        
        const id = req.params._id;
        const user = await Expense.findOne({ userId: req.user._id, _id: id })
        const response = await Expense.findByIdAndDelete({ _id: id }, { session })
        const totalExpense = Number(req.user.totalexpenses) - Number(user.expense);
        await User.updateOne({ _id: req.user._id }, { totalexpenses: totalExpense }, { session });
        await session.commitTransaction();
        if (response === 0) {
            return res.status(401).json({ message: "Expense does not Belongs to User", success: false });
        }

        res.status(200).json({ message: response, success: true, totalExpense: totalExpense });

    }
    catch (err) {
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({ message: err, success: false });
    } finally {
        session.endSession();
    }
}