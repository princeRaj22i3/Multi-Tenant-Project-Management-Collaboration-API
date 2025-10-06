const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    orgName:{type:String,unique:true,required:true},
    owner:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
    about:{type:String},
    type:{type:String,enum:['gaming','coding','music','entertainment','science and tech']},
    profilePic:{type:String},
    backgroundPic:{type:String},
    members:[{
        userId:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
        role:{type:String,enum:['admin','member'],default:'member'}
    }]
},{timestamps:true});

const orgModel = mongoose.model('organisation',orgSchema);

module.exports = orgModel;