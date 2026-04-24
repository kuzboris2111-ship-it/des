const{Schema,model}=require('mongoose')

const Chat= new Schema({
    groupId: { type: String, required: true},
    folderId:{type: String, required: true},
    message:[{
        text:{type:String},
        username:{ type: String, required: true },
        fileUrl:{type: String},
        fileName:{type: String},
        createdAt:{ type: Date, default: Date.now }
    }]
})

module.exports=model('Chat', Chat)
