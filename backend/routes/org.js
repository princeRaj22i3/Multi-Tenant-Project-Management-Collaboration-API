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
router.post('/member/add/:orgId', async(req,res)=>{
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
router.post('/member/role/:orgId', async (req,res)=>{
    const {orgId} = req.params;
    const {userId,role} = req.body;

    if(!userId) return res.status(400).json({msg:"userId is required"});
    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const targetUser = org.members.find(m=>m.userId.toString()===userId);
    if(!targetUser) return res.status(404).json({msg:"User is not a member of this organisation"});

    if(org.owner.toString()!==req.user.id && targetUser.role==='admin') return res.status(403).json({msg:"Permission Denied. Only Owner can update an Admin's role."})

    const isOwner = org.owner.toString()===req.user.id;
    const requester = org.members.find(m=>m.userId.toString()===req.user.id)
    if(!isOwner && !requester) return res.status(403).json({msg:"You are not a member of this organisation"});
    if(!isOwner && requester.role!=='admin') return res.status(403).json({msg:"Permission denied. Only admins can update roles"});

    if (org.owner.toString() === userId) return res.status(403).json({ msg: "Permission denied. Owner's role cannot be changed" });


    const updatedOrg = await orgModel.findOneAndUpdate(
        {_id:orgId,"members.userId":userId},
        {$set:{"members.$.role":role}},
        {new:true}
    )
    const user = await userModel.findById(userId); 
    return res.status(200).json({ msg:`${user.username}'s role has been updated to ${role}`, org: updatedOrg });
})


//to remove user
router.delete('/member/remove/:orgId', async(req,res)=>{
    const {orgId} = req.params;
    const {userId} = req.body;

    if(!userId) return res.status(400).json({msg:"userId is required"});
    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const owner = org.owner.toString() === req.user.id;
    if(!owner) return res.status(403).json({msg:"Permission denied. Only Owner can remove members"});
    
    if(org.owner.toString()===userId) return res.status(403).json({msg:"Permission denied. Owner cannot remove themselves"});

    const updatedOrg = await orgModel.findByIdAndUpdate(
        {_id:orgId},
        {$pull:{members:{userId}}},
        {new:true}
    )
    const user = await userModel.findById(userId); 
    return res.status(200).json({ msg:`${user.username} has been removed`, org: updatedOrg });
})

//to delete an organisation
router.delete('/delete/:orgId', async(req,res)=>{
    const {orgId} = req.params;
    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const owner = org.owner.toString() === req.user.id;
    if(!owner) return res.status(403).json({msg:"Permission denied. Only Owner can disassemble the organisation"});

    await orgModel.findByIdAndDelete(orgId);
    return res.status(200).json({ msg:`${org.orgName} is disassembled`});
})

module.exports = router;