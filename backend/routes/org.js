const express = require('express');
const router = express.Router();
const orgModel = require('../models/org');
const userModel = require('../models/user')


//to create an organisation
router.post('/create', async(req,res)=>{
    const {orgName} = req.body;
    const exist = await orgModel.findOne({orgName});
    if(exist) return res.status(409).json({msg:"Organisation name already exists. Try a different one."});
    const userId = req.user.id;
    const newOrg = await orgModel.create({
        orgName,
        owner: userId,
        members: [{userId,role:'admin'}]
    })
    return res.status(201).json({msg:"Organisation created successfully",org:newOrg});
})

//to add a member
router.post('/add/:orgId', async(req,res)=>{
    const {orgId} = req.params;
    const {userId, role} = req.body;

    if(!userId) return res.status(400).json({msg:"userId is required"});

    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation does not exist"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"You are not a member of this organisation"});
    if(requester.role!=='admin') return res.status(403).json({msg:"Permission denied. Only admins can add members"});

    const userExists = org.members.some(m=>m.userId.toString()===userId);
    if(userExists) return res.status(409).json({msg:"Member is a member of the organisation"});

    const updatedOrg = await orgModel.findByIdAndUpdate(
        orgId,
        {$push:{members:{userId,role:role||'member'}}},
        {new:true}
    )
    const user = await userModel.findById(userId); 
    return res.status(200).json({msg:`${user.username} has been hired`, org:updatedOrg});
})


//to update member role
router.post('/role/:orgId', async (req,res)=>{
    const {orgId} = req.params;
    const {userId,role} = req.body;

    if(!userId) return res.status(400).json({msg:"userId is required"});
    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation does not exist"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"You are not a member of this organisation"});
    if(requester.role!=='admin') return res.status(403).json({msg:"Permission denied. Only admins can update roles"});

    const updatedOrg = await orgModel.findOneAndUpdate(
        {_id:orgId,"members.userId":userId},
        {$set:{"members.$.role":role}},
        {new:true}
    )
    const user = await userModel.findById(userId); 
    return res.status(200).json({ msg:`${user.username} has been promoted to be an admin`, org: updatedOrg });
})

module.exports = router;