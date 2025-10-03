const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    taskId:{type:mongoose.Schema.Types.ObjectId,ref:'task',required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
    text:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    reply:[{
        replierId:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
        replyText:{type:String},
        repliedAt:{type:Date,default:Date.now}
    }]
})

const commentModel = mongoose.model('comment',commentSchema);

module.exports = commentModel;