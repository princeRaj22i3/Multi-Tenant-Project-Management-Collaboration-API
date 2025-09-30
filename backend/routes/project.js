const express = require('express');
const router = express.Router();
const orgModel = require('../models/org');
const userModel = require('../models/user');
const projectModel = require('../models/project');

router.post('/create/:orgId',async(req,res)=>{
    const {orgId} = req.params;
    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"User is not a member of the organisation"});
    if(user.role!=='admin') return res.status(403).json({msg:"Permission denied. Only admins can create projects."});


    const {projectName,description} = req.body;
    if(!projectName) return res.status(400).json({msg:"Project name is required"});
    const projectExists = await projectModel.findOne({orgId,projectName});
    if(projectExists) return res.status(409).json({msg:"Project already exists. Use a different name."});

    const newProject = await projectModel.create({
        orgId,
        projectName,
        createdBy:req.user.id,
        description,
        status:'pending'
    })

    return res.status(201).json({msg:"Project created",project:newProject});
})

router.post('/status/:projectId',async(req,res)=>{
    const {projectId} = req.params;
    const {status} = req.body;

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    const org = await orgModel.findById(project.orgId);
    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"Permission denied. User is not a member of the Organisation"});

    const validStatuses = ['pending','dropped','completed','in progress'];
    if (!validStatuses.includes(status)) return res.status(400).json({ msg: "Invalid status" });

    
    await projectModel.findByIdAndUpdate(
        projectId,
        {status:status},
        {new:true}
    )
    return res.status(200).json({msg:"status updated"});
})

module.exports = router;