const{Schema,model}=require('mongoose')

const Drawing = new Schema({
    groupId: { type: String, required: true, unique: true },
    lines: [{
            points:{type:Array, default: []},
    lineId:{type:String, required: true},
}]
})


module.exports=model('Drawing', Drawing)
