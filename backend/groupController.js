const group=require('./models/Group')
const bcrypt=require('bcrypt')
const {validationResult}=require('express-validator')
const jwt=require('jsonwebtoken')
const {secret}=require("./secretkeys.js")
const fs = require('fs');
const path = require('path')

const generatetoken=(id)=>{
       const payload={
        id
       }
       return jwt.sign(payload, secret, {expiresIn: "24h"})
}

class groupController{
    async registration(req, res){
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({message:'Registration group error 11'})
        }
        const {groupname, password}=req.body
        const candidate=await group.findOne({groupname})
        if(candidate){
            return res.status(400).json({message:'Registration group error 12'})
        }
        const hash = bcrypt.hashSync(password, 7);
        const NewGroup=new group({
                groupname,
                password: hash,
                Admins: [],
                Users: []})
        await NewGroup.save()
        fs.mkdir(path.join(__dirname, '../groups', groupname), { recursive: true }, (err) => {if (err) console.log(err)})
        return res.json({message:"ALL OK"})

    }
    catch(err){
        console.log(err)
        return res.status(400).json({message:'Registration group error 1'})
    }
    }
    async login(req,res){
        try{
            const {groupname, password}=req.body
            const Mgroup=await group.findOne({groupname})
            if(!Mgroup){
                return res.status(400).json({message:'Registration group error 21'})
            }
            const validpas= bcrypt.compareSync(password, group.password)
            if(!validpas){
                return res.status(400).json({message:'Registration group error 22'})
            }
            const token=generatetoken(group._id)
            return res.json({token})
        }
        catch{
            return res.status(400).json({message:'Registration group error 2'})
        }
    }
}

module.exports = new groupController()