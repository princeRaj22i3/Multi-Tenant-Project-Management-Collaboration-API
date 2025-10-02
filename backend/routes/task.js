const express = require('express');
const router = express.Router();
const orgModel = require('../models/org');
const userModel = require('../models/user');
const projectModel = require('../models/project');
const taskModel = require('../models/project');

//to create a task
router.post('/create/:projectId',async(req,res)=>{
    const {projectId} = req.params;
    const {title,dueDate} = req.body;
    if(!title) return res.status(400).json({msg:"Title is required"});

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"});

    const org = await orgModel.findById(project.orgId)
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. User is not a member of the organisation."});
    if(requester.role.toString()!=='admin') return res.status(403).json({msg:"Permission denied. Only Admins can create tasks."});

    const newTask = await taskModel.create({
        projectId,
        title,
        status:'pending',
        assignees:[requester.userId],
        dueDate:dueDate||null,
    })

    const user = await userModel.findById(requester.userId);
    return res.status(201).json({msg:`Task ${title} created by ${user.username}`,task:newTask});
})

//to add assignees
router.post('/assign/:projectId',async(req,res)=>{
    const{projectId} = req.params;
    const{taskId,userId} = req.body;
    
    if(!taskId) return res.status(400).json({msg:"taskId is required"});
    if(!userId) return res.status(400).json({msg:"userId is required"});

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"});
    
    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task not found"});

    if(task.projectId.toString()!==projectId) return res.status(403).json({msg:"Task doesn't exist in the project"});

    const org = await orgModel.findById(project.orgId)
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. User is not a member of the organisation."});
    if(requester.role.toString()!=='admin') return res.status(403).json({msg:"Permission denied. Only Admins can assign tasks."});

    const user = org.members.find(m=>m.userId.toString()===userId);
    if(!user) return res.status(403).json({msg:"User must belong to the organisation"});

    const dupUser = task.assignees.find(m=>m.toString()===userId);
    if(dupUser) return res.status(409).json({msg:"User has already been assigned"});

    const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        {$push:{assignees:userId}},
        {new:true}
    )

    const assigned = await userModel.findById(userId);
    const assignedBy = await userModel.findById(requester.userId);
    return res.status(200).json({msg:`${assigned.username} has been assigned with the task-${task.title} by ${assignedBy.username}`,task:updatedTask})
})

//to remove assignee
router.post('/remove/:projectId',async (req,res)=>{
    const {projectId} = req.params;
    const {taskId,userId} = req.body;
    if(!taskId) return res.status(400).json({msg:"taskId is required"});
    if(!userId) return res.status(400).json({msg:"userId is required"});

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"});

    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task not found"});

    if(task.projectId.toString()!==projectId) return res.status(403).json({msg:"Task doesn't exist in the project"});

    const org = await orgModel.findById(project.orgId)
    if(!org) return res.status(404).json({msg:"Organisation not found"});
    
    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. User is not a member of the organisation."});
    if(requester.role.toString()!=='admin') return res.status(403).json({msg:"Permission denied. Only Admins can remove assignees."});

    const user = task.assignees.find(m=>m.toString()===userId);
    if(!user) return res.status(403).json({msg:"User is not assigned to the task"});

    const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        {$pull:{assignees:mongoose.Types.ObjectId(userId)}},
        {new:true},
    )

    const a = await userModel.findById(userId);
    return res.status(200).json({msg:`${a.username} has been removed form the assigned task ${task.title}`,task:updatedTask});
})

//to delete a task
router.delete('/delete/:projectId',async (req,res)=>{
    const {projectId} = req.params;
    const {taskId} = req.body;
    if(!taskId) return res.status(400).json({msg:"taskId is required"});

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"});

    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task not found"});

    if(task.projectId.toString()!==projectId) return res.status(403).json({msg:"Task doesn't exist in the project"});

    const org = await orgModel.findById(project.orgId)
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. User is not a member of the organisation."});
    if(requester.role.toString()!=='admin') return res.status(403).json({msg:"Permission denied. Only Admins can delete tasks."});

    const user = await userModel.findById(req.user.id);

    await taskModel.findByIdAndDelete(taskId);
    return res.status(200).json({msg:`${task.title} has been deleted by ${user.username}`})
})

//to update task parameters
router.post('/:projectId',async (req,res)=>{
    const {projectId} = req.params;
    const {taskId,title,status,dueDate} = req.body;
    if(!taskId) return res.status(400).json({msg:"taskId is required"});

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project not found"});

    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task not found"});

    if(task.projectId.toString()!==projectId) return res.status(403).json({msg:"Task doesn't exist in the project"});

    const org = await orgModel.findById(project.orgId)
    if(!org) return res.status(404).json({msg:"Organisation not found"});

    const requester = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!requester) return res.status(403).json({msg:"Permission denied. User is not a member of the organisation."});
    if(requester.role.toString()!=='admin') return res.status(403).json({msg:"Permission denied. Only Admins can edit task parameters."});

    const updatedTask = {};
    if(title) updatedTask.title = title;
    if(status){
        const validStatuses = ['in progress','pending','completed'];
        if(!validStatuses.includes(status)) return res.status(400).json({msg:"Invalid status"});
        updatedTask.status = status;
    }
    if(dueDate) updatedTask.dueDate = new Date(dueDate);

    if(Object.keys(updatedTask).length === 0){
        return res.status(400).json({msg:"No valid fields provided for update"});
    }

    const newTask = await taskModel.findByIdAndUpdate(
        taskId,
        updatedTask,
        {new:true}
    )

    const user = await userModel.findById(req.user.id);
    return res.status(200).json({msg:`${task.title} updated by ${user.username}`,task:newTask});
})

module.exports = router;