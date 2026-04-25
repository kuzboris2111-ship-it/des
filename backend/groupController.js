const group=require('./models/Group')
const User = require('./models/User')
const bcrypt=require('bcrypt')
const {validationResult}=require('express-validator')
const jwt=require('jsonwebtoken')
const {secret}=require("./secretkeys.js")
const fs = require('fs');
const path = require('path')
const Drawing = require('./models/Drawing')
const Chat=require('./models/Chat')
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
        const {groupname, password, userId}=req.body
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
        await User.findByIdAndUpdate(userId, { $push: { groups: NewGroup._id } })
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
            return res.json({token, groupId: Mgroup._id})
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
            for (let i  of foundGroup.folders){
                if(String(i.parentId)===String(parentId)){
                    childsId.push(i.id)
                    childsId.push(...reqdel(i.id))
                }
            }
            return childsId
            }
        const a = [String(folderId), ... reqdel(folderId)]
        foundGroup.folders = group.folders.filter(f => !a.includes(f.id))

        foundGroup.folders=foundGroup.folders.filter(f=>!a.includes(String(i.id)))
        await foundGroup.save()
        res.json("group delte")
    }



    async addLine(req, res) {
    try {
        const {groupId, folderId, line}=req.body;
        const a= await Drawing.findOneAndUpdate(
            {groupId: groupId, folderId:folderId},
            {$push:{lines:line}},
            { upsert:true}
        );
        res.json({message:"Line append"});
    }
    catch(err){
            console.log('ОШИБКА В addLine:', err.message)
    res.status(400).json({ message: err.message })
    }
}
    async getLines(req,res){
        try{
            const {groupId, folderId}=req.params
            const line = await Drawing.findOne({groupId:groupId, folderId:folderId})
            if(!line) return res.json({lines:[]})
            res.json({lines:line.lines})

        }
        catch{
            res.status(400).json({message:"Error in getting line"});
        }
    }
    async getLinesByGroup(req, res) {
    try {
        const {groupId} = req.params
        const drawings = await Drawing.find({ groupId: groupId })
        const allLines = drawings.flatMap(d => d.lines)
        res.json({lines: allLines })
    } catch {
        res.status(400).json({ message: "Error" })
    }
}
    async addMessage(req,res){
    try{
        const { groupId, folderId, text,username, fileUrl, fileName}=req.body
        await Chat.findOneAndUpdate(
            {groupId,folderId},
            {
            $push: {
                message: { text, username, fileUrl, fileName, createdAt: new Date() }
            }},
            { upsert: true, returnDocument: 'after'}

        )
        res.json({message:"Message append"});
    }
    catch(e){
            res.status(400).json({ message: "Error" })

    }
    }
    async getMessage(req,res){
        try{
        const {groupId, folderId}=req.params
        const chat =await Chat.findOne({groupId:groupId, folderId:folderId})
        if(!chat){ return res.json({message:[]})}
        res.json({message:chat.message})
        }

        catch{
                        res.status(400).json({ message: "Error" })

        }
}
async uploadFile(req, res) {
try {
const file = req.file

if (!file) {
return res.status(400).json({ message: 'Файл не загружен' })
}

res.json({
fileUrl: `/uploads/${file.filename}`,
fileName: file.originalname
})

} catch (e) {
res.status(500).json({ message: 'Ошибка загрузки файла' })
}
}
}

module.exports = new groupController()