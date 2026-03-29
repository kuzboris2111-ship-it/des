const{Schema,model}=require('mongoose')


const Group=new Schema({
    groupname:{type:String, unique:true, required:true},
    password:{type:String, required:true},
    Admins:[{type:String}],                   // админы у них только имя они входят в пользователей также могут входить в отделы
    Users:[{
        name: {type: Schema.Types.ObjectId, ref: 'User' },
        Urls:[{type:String}]
        }]     // у каждого пользователя могут быть несколько отделов где он работает
})
module.exports=model('Group', Group)