const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
require('dotenv').config();
const jwtKey = process.env.JWT_AUTH_KEY;

router.post('/', async(req,res)=>{
    const {username,password} = req.body;
    if(!username||!password) return res.status(400).json({msg:"Username or password is missing"});

    const user = await userModel.findOne({username});
    if(!user) return res.status(401).json({msg:"Invalid username or password"});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(401).json({msg:"Invalid username or password"});

    const token = jwt.sign({username, id:user._id},jwtKey,{expiresIn:'7d'});

    res.cookie('token', token,{
        httpOnly:true,
        secure:false,
        maxAge:3600000,
    })

    res.status(200).json({msg:"User logged in successfully"});
})

module.exports = router;