    //маршруты, по которым отправляются запросы
    const express = require('express');
    const router = express.Router();
    const groupContrl=require('./groupController')
    const {check}=require('express-validator')
    const multer = require('multer')
    const path=require('path')
//---------------------------------------
        const storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
        filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
    })
//-------------------------------------------
const upload = multer({ storage })
router.post('/upload', upload.single('file'), groupContrl.uploadFile)

    router.post('/registration', [
        check('groupname', 'groupname is empty').notEmpty(),
        check('password', 'password must be have min:6, max:10 symbols').isLength({min: 6})
    ], groupContrl.registration)

    router.post('/login', groupContrl.login)

    router.post('/folder', groupContrl.createFolder)
    router.delete('/folder', groupContrl.deleteFolders)
    router.get('/:groupId/folders', groupContrl.getFolders)
    router.put('/folder', groupContrl.updateFolders)

    router.post('/drawing/line', groupContrl.addLine)
    router.get('/drawing/:groupId', groupContrl.getLinesByGroup)
    router.get('/drawing/:groupId/:folderId', groupContrl.getLines)



    router.post('/chat/message', groupContrl.addMessage)
    router.get('/chat/:groupId/:folderId', groupContrl.getMessage)

    module.exports=router