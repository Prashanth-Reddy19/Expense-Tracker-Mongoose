const Razorpay = require('razorpay');
const Order = require('../models/orders')
const jwt = require('jsonwebtoken');

// Purchase premium

exports.purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500;
        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            const neworder =new Order({ orderid: order.id, status: 'PENDING',userId:req.user._id})

            neworder.save()
            .then(() => {
                return res.status(201).json({ order, key_id : rp.key_id});

            }).catch(err => {
                throw new Error(err)
            })
        })
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Sometghing went wrong', error: err })
    }
}

// Token 

function generateAccessToken(id,name,ispremiumuser) {
    return jwt.sign({ userId: id ,name,ispremiumuser}, process.env.TOKEN_SECRET);

}

// Update transcations

exports.updateTransactionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { payment_id, order_id } = req.body;
       
        const promise1 =  Order.findOneAndUpdate({orderid:order_id},{ paymentid: payment_id, status: 'SUCCESSFUL'})
        const promise2 =  User.findByIdAndUpdate({_id:userId},{ ispremiumuser: true }) 


        Promise.all([promise1, promise2]).then(() => {
            return res.status(202).json({ sucess: true, message: "Transaction Successful", token: generateAccessToken(userId, undefined, true) })
        }).catch((error) => {
            throw new Error(error)
        })

    } catch (err) {
        console.log(err);
        res.status(403).json({ error: err, message: 'Sometghing went wrong' })

    }
}