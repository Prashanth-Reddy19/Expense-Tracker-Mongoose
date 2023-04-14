const User = require('../models/users');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

function isstringinvalid(string) {
    if (string == undefined || string.length === 0) {
        return true
    } else {
        return false
    }
}

//SignUp 

exports.signup = async (req, res) => {
    try {
        console.log('=================> heloooooooo')
        const { name, email, password } = req.body
        if (isstringinvalid(name) || isstringinvalid(email) || isstringinvalid(password)) {
            return res.status(400).json({ err: 'bad parameters Something is missing' })
        }

        const saltRounds = 5;
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            try {
                const user = new User(
                    {
                        name: name,
                        email: email,
                       
                        password: hash,
                        ispremiumuser: false
                    })

                await user.save();

                res.status(201).json({ message: "Successfully Created New User" });
            }

            catch (err) {
                console.log(err)
                if (err.code = 11000) {
                    err = "User Already Exists";
                }
                else {
                    err = "OOPS! Something Went wrong";
                }
                res.status(500).json({
                    message: err
                });
            }
        })
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
}

function generateAceessToken(id, name, ispremiumuser) {
    return jwt.sign({ userId: id, name: name, ispremiumuser }, process.env.TOKEN_SECRET)
}


// Login page

exports.login= async (req,res,next)=>{
    try{
        const{email,password}=req.body;
        const user= await User.findOne({email:email});
        if(user)
        {
        bcrypt.compare(password,user.password,(err,result)=>{
            if(err){
              throw new Error("Something Went Wrong");
            }
            if(result===true){
                return res.status(200).json({success:true,message:"User Logged in  Successfully",token:generateAceessToken(user._id,user.username,user.ispremiumuser)});
            }
                else{
                return res.status(400).json({success:false,message:"Password is invalid"});
             }
        })   
        }
        else{
            return res.status(404).json({success:false,message:"User does Not Exist"});
        }
    }catch(err){
        return res.status(500).json({success:false,message:err});
    }     
    }