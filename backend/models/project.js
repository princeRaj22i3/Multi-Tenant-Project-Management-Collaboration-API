const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    orgId:{type:mongoose.Schema.Types.ObjectId, ref:'organisation', required:true},
    projectName:{type:String,required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'user',required:true},
    description:{type:String},
    status:{type:String,enum:['pending','dropped','completed','in progress'],default:'pending'},
},{timestamps:true});

projectSchema.index({orgId:1,projectName:1},{unique:true});

const projectModel = mongoose.model('project',projectSchema);

module.exports = projectModel;