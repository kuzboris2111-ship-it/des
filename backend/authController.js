const User=require('./models/User')
const Role=require('./models/Role')
const bcrypt=require('bcrypt')
const {validationResult}=require('express-validator')
const jwt=require('jsonwebtoken')
const {secret}=require("./secretkeys.js")

const generatetoken=(id,roles)=>{
       const payload={
        id,
        roles
       }
       return jwt.sign(payload, secret, {expiresIn: "24h"})
}




class authController{
    async registration(req,res){
        try{
            const errors=validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message:'Registration12 error'})
            }
            const {username, password}=req.body
            const candidate=User.findOne({username})
            if(!candidate){
                return res.status(400).json({message:'Registration1 error'})
            }
            const hash = bcrypt.hashSync(password, 7);
            const userRole=await Role.findOne({value:'user'})
            const user=new User({username,password:hash, roles:[userRole.value]})
            await user.save()
            return res.json({message:"ALL OK"})
        }
        catch(err){
            console.log("ddsdc",err)
            res.status(400).json({message:'Registration error'})
        }
    }
    async login(req,res){
        try{
            const{username, password}=req.body
            const user=await User.findOne({username})
            if(!user){
                return res.status(400).json({message:'Registration1 error'})
            }
            const validpas= bcrypt.compareSync(password, user.password)
            if(!validpas){
                return res.status(400).json({message:'Registration2 error'})
            }
            const token=generatetoken(user._id,user.roles)
            return res.json({token})
        }
        catch(err){
            console.log(err)
            res.status(400).json({message:'Login error'})
        }
    }
    async getUs(req,res){
        try{
            const userRole=new Role()
            const adminRole=new Role({value:'admin'})
            await userRole.save()
            await adminRole.save()

            const users=await User.find()
            res.json(users)
        }
        catch(err){
            console.log(err)
        }
    }
}

module.exports = new authController();