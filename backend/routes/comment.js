const express = require('express');
const router = express.Router();
const commentModel = require('../models/comment');
const orgModel = require('../models/org');
const userModel = require('../models/user');
const projectModel = require('../models/project');
const taskModel = require('../models/task');

//to add a comment
router.post('/add/:taskId',async(req,res)=>{
    const {taskId} = req.params;
    const {projectId,text} = req.body;

    if(!text||text.trim().length===0) return res.status(400).json({msg:"This field cannot be empty"});

    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task doesn't exist"});

    const project = await projectModel.findById(projectId);
    if(!project) return res.status(404).json({msg:"Project doesn't exist"});
    if(task.projectId.toString()!==projectId) return res.status(403).json({msg:"Task doesn't belong to the project"});

    const org = await orgModel.findById(project.orgId);
    if(!org) return res.status(404).json({msg:"Organisation doesn't exist"});

    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"User must be member of the organisation to comment"});

    const comment = await commentModel.create({
        taskId,
        userId:req.user.id,
        text,
        reply:[]
    })
    return res.status(201).json(comment)
})

//add a reply
router.post('/reply/:commentId',async(req,res)=>{
    const {commentId} = req.params;
    const {replyText,taskId} = req.body;

    if(!replyText||replyText.trim().length==0) return res.status(400).json({msg:"This field cannot be empty"});

    const comment = await commentModel.findById(commentId);
    if(!comment) return res.status(404).json({msg:"Comment not found"});

    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task doesn't exist"});

    if(taskId!==comment.taskId.toString()) return res.status(403).json({msg:"Permission denied"});

    const project = await projectModel.findById(task.projectId);
    if(!project) return res.status(404).json({msg:"Project doesn't exist"});

    const org = await orgModel.findById(project.orgId);
    if(!org) return res.status(404).json({msg:"Organisation doesn't exist"});

    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"User must be member of the organisation to comment"});

    const reply = await commentModel.findByIdAndUpdate(
        commentId,
        {$push:{reply:{replierId:user.userId,replyText:replyText.trim()}}},
        {new:true}
    )
    return res.status(200).json(reply)
})

//delete a reply
router.delete('/reply/delete/:commentId',async(req,res)=>{
    const {commentId} = req.params;
    const {taskId,replierId} = req.body;

    const comment = await commentModel.findById(commentId);
    if(!comment) return res.status(404).json({msg:"Comment not found"});

    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task doesn't exist"});
    if(taskId!==comment.taskId.toString()) return res.status(403).json({msg:"Permission denied"});

    const project = await projectModel.findById(task.projectId);
    if(!project) return res.status(404).json({msg:"Project doesn't exist"});

    const org = await orgModel.findById(project.orgId);
    if(!org) return res.status(404).json({msg:"Organisation doesn't exist"});

    const replier = comment.reply.find(m=>m.replierId.toString()===replierId);
    if(!replier) return res.status(404).json({msg:"Replier not found"});

    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"User must be member of the organisation"});

    const a = await userModel.findById(req.user.id);
    if(a.role==='admin'||replierId===req.user.id){
        const updatedReply = await commentModel.findByIdAndUpdate(
            commentId,
            {$pull:{reply:{replierId: mongoose.Types.ObjectId(replierId)}}},
            {new:true},
        )
        return res.status(200).json({updatedReply});
    }
    return res.status(403).json({msg:"Permission denied. Only admins or replier can delete the message"});

})

//delete a comment
router.delete('/delete/:commentId',async(req,res)=>{
    const {commentId} = req.params;
    const {taskId} = req.body;

    const comment = await commentModel.findById(commentId);
    if(!comment) return res.status(404).json({msg:"Comment not found"});
    
    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task doesn't exist"});
    if(taskId!==comment.taskId.toString()) return res.status(403).json({msg:"Permission denied"});

    const project = await projectModel.findById(task.projectId);
    if(!project) return res.status(404).json({msg:"Project doesn't exist"});

    const org = await orgModel.findById(project.orgId);
    if(!org) return res.status(404).json({msg:"Organisation doesn't exist"});

    const user = org.members.find(m=>m.userId.toString()===req.user.id);
    if(!user) return res.status(403).json({msg:"User is not a member of the organisation"});

    const a = await userModel.findById(req.user.id);
    if(a.role==='admin'||comment.userId.toString()===req.user.id){
        await commentModel.findByIdAndDelete(commentId);
        return res.status(200).json({msg:"comment deleted"});
    }
    return res.status(403).json({msg:"Permission denied. Only admins or replier can delete the message"});
})

//edit comment or reply
router.post('/edit/:commentId/:replyId',async(req,res)=>{
    const {commentId,replyId} = req.params;
    const {text,replyText} = req.body;

    const comment = await commentModel.findById(commentId);
    if(!comment) return res.status(404).json({msg:"Comment not found"});

    if(text){
        if(comment.userId.toString()!==req.user.id) return res.status(403).json({msg:"Permission denied"});

        if(text.trim().length===0) return res.status(400).json({msg:"This field cannot be left empty"});
        const updatedComment = await commentModel.findByIdAndUpdate(
            commentId,
            {text:text.trim()},
            {new:true}
        )
        return res.status(200).json({msg:"Comment updated",comment:updatedComment});
    }
    if(replyText){
        const reply = comment.reply.id(replyId);
        if(!reply) return res.status(404).json({msg:"Reply not found"});

        if(reply.replierId.toString()!==req.user.id) return res.status(403).json({msg:"Permission denied"});
        if(replyText.trim().length===0) return res.status(400).json({msg:"This field cannot be left empty"});

        reply.replyText = replyText.trim();
        await comment.save();
        return res.status(200).json({msg:"Reply updated",reply});
    }
    if(!text&&!replyText) return res.status(400).json({msg:"No text provided"});
})

//fetch comments and replies
router.get('/:taskId',async(req,res)=>{
    const {taskId} = req.params;
    const task = await taskModel.findById(taskId);
    if(!task) return res.status(404).json({msg:"Task not found"});

    const comments = await commentModel
    .find({taskId})
    .populate('userId','username')
    .populate('reply.replierId','username')
    .sort({createdAt:-1});

    res.status(200).json({ comments });
})

module.exports = router;