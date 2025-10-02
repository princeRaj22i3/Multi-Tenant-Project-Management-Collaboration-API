const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    projectId:{type:mongoose.Schema.Types.ObjectId,ref:'project',required:true},
    title:{type:String,required:true},
    status:{type:String,enum:['pending','in progress','completed'],default:'pending'},
    assignees:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
    dueDate:{type:Date},
},{timestamps:true});

const taskModel = mongoose.model('task',taskSchema);

module.exports = taskModel;