const{Schema,model}=require('mongoose')


const Role=new Schema({
    value:{type:String, unique:true, default:"user"},
})
const Admin=new Schema({
    value:{type:String, unique:true, default:"admin"}
})
module.exports=model('Role', Role)