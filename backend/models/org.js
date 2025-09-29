const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    orgName:{type:String,unique:true,required:true},
    owner:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
    members:[{
        userId:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
        role:{type:String,enum:['admin','member'],default:'member'}
    }]
},{timestamps:true});

const orgModel = mongoose.model('organisation',orgSchema);

module.exports = orgModel;