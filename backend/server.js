const express = require('express')
const path = require('path')
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const mongoose=require('mongoose')
const authRouter=require('./authRouter')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const PORT = 3000

//app.get("/api/department", (req,res)=>{
//    res.json({data:dep})
//});
//
//app.get("/", (req,res)=>{
//    res.sendFile(path.join(__dirname, '../static/index.html'));
//});
app.use(express.json())
app.use('/auth', authRouter)
//проверка подключений
let connections = [];
io.on("connection", (socket) => {
    console.log("connect");
    connections.push(socket);

    socket.on("disconnect", () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log("disconnect");
    });
});//
const start=async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/orgaspace')
        app.listen(PORT,()=>console .log(`Для общего пользования по WIFI: http://192.168.0.192:${PORT}`))
        app.listen(PORT, ()=>console.log(`Для ноутбука:http://localhost:${PORT}`))
    }
    catch(err){
        console.log(err)
    }
}
start()