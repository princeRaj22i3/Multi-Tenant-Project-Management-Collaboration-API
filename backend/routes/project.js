const express = require('express');
const router = express.Router();
const orgModel = require('../models/org');
const userModel = require('../models/user');
const projectModel = require('../models/project');

//to create a project
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

//to update project status
router.post('/status/:projectId',async(req,res)=>{
    const {projectId} = req.params;
    const {status} = req.body;

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    const org = await orgModel.findById(project.orgId);
    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"Permission denied. User is not a member of the Organisation"});

    const validStatuses = ['pending','dropped','completed','in progress'];
    if(!validStatuses.includes(status)) return res.status(400).json({ msg: "Invalid status" });

    
    await projectModel.findByIdAndUpdate(
        projectId,
        {status:status},
        {new:true}
    )
    return res.status(200).json({msg:"status updated"});
})

//to delete a project
router.delete('/delete/:orgId',async(req,res)=>{
    const {orgId} = req.params;
    const {projectId} = req.body;

    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    if(!projectId) return res.status(400).json({msg:"The projectId is required"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. Requester must be a member of the organisation"});
    if(requester.role!='admin') return res.status(403).json({msg:"Permission denied. Requester must be an Admin to delete a project"});

    const found = await projectModel.findById(projectId);
    if(!found) return res.status(404).json({msg:"Project not found"})
    if(found.orgId.toString()!==orgId) return res.status(403).json({msg:"Permission denied. Project doesn't exist in the organisation."});

    await projectModel.findByIdAndDelete(projectId);
    return res.status(200).json({msg:`${found.projectName} deleted`});
})

//to see a project
router.get('/:orgId/:projectId',async(req,res)=>{
    const {orgId,projectId} = req.params;

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"})

    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. Requester must be a member of the organisation"});

    if(project.orgId.toString()!==orgId)  return res.status(403).json({msg:"Permission denied"});

    res.status(200).json(project);
})

//to see all the projects of an org
router.get('/:orgId', async(req,res)=>{
    const {orgId} = req.params;

    const org = await orgModel.findById(orgId);
    if(!org) return res.status(404).json({msg:"Organisation not found"});
    
    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. Requester must be a member of the organisation"});

    const project = await projectModel.find({orgId})
    res.status(200).json(project)
})

//to change name and description
router.post('/:orgId',async(req,res)=>{
    const {orgId} = req.params;
    const {projectId,projectName,description} = req.body;

    if(!projectId) return res.status(400).json({msg:"projectId is required"});
    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"});

    if(project.orgId!==orgId) return res.status(403).json({msg:"Project doesn't belong in this organisation"});

    const org = await orgModel.findById(orgId);

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. Requester must be a member of the organisation"});
    if(requester.role!=='admin') return res.status(403).json({msg:"You must be an admin to perform the action"});

    const updateData = {};
    if (projectName) updateData.projectName = projectName;
    if (description) updateData.description = description;

    const exist = await projectModel.findOne({orgId,projectName,_id: { $ne: projectId}});
    if(exist) return res.status(409).json({msg:"Project name taken. Use a different name"});

    const updatedProject = await projectModel.findByIdAndUpdate(
        projectId,
        updateData,
        {new:true}
    )

    const user = await userModel.findById(requester.userId);
    return res.status(200).json({msg:`${user.username} has updated the Project name or description`,project:updatedProject});
})

module.exports = router;