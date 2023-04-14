const express = require('express');
require('dotenv').config()
const mongoose=require('mongoose');



// Routes Related 

const userRoutes = require('./routes/user')
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const PremiumRoutes = require('./routes/premium')
const resetPasswordRoutes = require('./routes/resetpassword')

var cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json())
app.use(userRoutes)
app.use(expenseRoutes)
app.use(purchaseRoutes)
app.use(PremiumRoutes);
app.use(resetPasswordRoutes);



mongoose
.connect('mongodb+srv://reddyprashanth337:9949351872@cluster1.zacx0li.mongodb.net/kpr')
.then(()=>{
    console.log("Connected!!");
})
.then(()=>{
    app.listen(process.env.PORT||3000);
}).catch(err=>console.log(err));


