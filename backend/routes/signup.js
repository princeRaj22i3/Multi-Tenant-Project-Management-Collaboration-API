const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../models/user');

router.post('/', async(req,res)=>{
    const {username, password} = req.body;
    if(!username||!password) return res.status(400).json({msg:"Username or password is missing"});

    const existingUser = await userModel.findOne({username});
    if(existingUser) return res.status(409).json({msg:"Username already exists"});

    const pass = await bcrypt.hash(password,10);
    await userModel.create({
        username,
        password:pass,
    })
    res.status(201).json({msg:"User created successfully"});
})

module.exports = router;