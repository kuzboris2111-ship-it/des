//маршруты, по которым отправляются запросы
const express = require('express');
const router = express.Router();
const groupContrl=require('./groupController')
const {check}=require('express-validator')

router.post('/registration', [
    check('groupname', 'groupname is empty').notEmpty(),
    check('password', 'password must be have min:6, max:10 symbols').isLength({min: 6, max: 10})
], groupContrl.registration)

router.post('/login', groupContrl.login)


module.exports=router