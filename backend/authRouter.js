//маршруты, по которым отправляются запросы
const express = require('express');
const router = express.Router();
const contrl=require('./authController')
const {check}=require('express-validator')
const authController = require('./authController')

router.post('/registration',[
    check('username', 'username is empty').notEmpty(),
    check('password', 'password must be have min:6, max:10 symbols').isLength({min:6, max:10})
], contrl.registration)
router.post('/login', contrl.login)
router.get('/login', contrl.getUs)
router.get('/groups', authController.getUserGroups)

module.exports=router