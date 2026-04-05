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
                Users: [],
                folders:[]
                })
        await NewGroup.save()
        fs.mkdir(path.join(__dirname, '../groups', groupname), { recursive: true }, (err) => {if (err) console.log(err)})
        return res.json({ message: "ALL OK", groupId: NewGroup._id })

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
            const validpas= bcrypt.compareSync(password, Mgroup.password)
            if(!validpas){
                return res.status(400).json({message:'Registration group error 22'})
            }
            const token=generatetoken(Mgroup._id)
            return res.json({token})
        }
        catch{
            return res.status(400).json({message:'Registration group error 2'})
        }
    }
    async createFolder(req,res){
        try{
            const {groupId, name, parentId}=req.body

            const Q={
                id:String(Date.now()) ,
                name: name,
                parentId: parentId}

            const foundGroup = await group.findById(groupId)
            if (!foundGroup) {
            return res.status(404).json({ message: 'Группа не найдена' })
        }
            foundGroup.folders.push(Q)
            await foundGroup.save()
            return res.json(Q)

        }
        catch{
            return res.status(400).json({message:'Registration group error 2'})
        }

    }
    async getFolders(req, res) {
        try{
            const {groupId} = req.params
            const finGroup = await group.findById(groupId)
            if (!finGroup) {
            return res.status(404).json({ message: 'Группа не найдена' })
        }
            res.json(finGroup.folders)
        }
        catch(err){
            console.log(err)
            return res.status(400).json({message:'Registration group error 2'})
        }
        }

    async updateFolders(req, res){
        try{
            const {groupId, name, folderId }=req.body
            const foundGroup = await group.findById(groupId)
            const folder = foundGroup.folders.find(f => f.id === folderId)
            if(!folder){
                return res.status(400).json({message:'Registration group error 2'})
            }
            folder.name=name
            await foundGroup.save()
            res.json(folder)
        }
        catch{
            return res.status(400).json({message:'Registration group error 2'})
        }
    }
    async deleteFolders(req, res){
        const {groupId, foldersId}=req.body
        const foundGroup=await group.findById(groupId)
            if (!foundGroup) return res.status(404).json({ message: 'Группа не найдена' })

        function reqdel(parentId){
            const childsId=[]
            for (let i  of group.folders){
                if(i.parentId==parentId){
                    childsId.push(i.id)
                    childsId.push(...reqdel(i.id))
                }
            }
            return childsId
            }
        const a = [foldersId, ... reqdel(foldersId)]
        group.folders = group.folders.filter(f => !a.includes(f.id))
        await group.save()
        res.json("group delte")
    }

}

module.exports = new groupController()