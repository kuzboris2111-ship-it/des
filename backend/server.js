const express = require('express')
const path = require('path')
const mongoose=require('mongoose')
const authRouter=require('./authRouter')
const groupRouter=require("./groupRouter")
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const PORT = 3000




app.use(express.json())
app.use('/static', express.static(path.join(__dirname, '../static')))
app.use('/auth', authRouter)
app.use('/groups', groupRouter)
//проверка подключений
let connections = [];
io.on("connection", (socket) => {
    console.log("connect");
    connections.push(socket);

    socket.on("disconnect", () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log("disconnect");
    });
});
//-------------------------------------------------------
const start=async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/orgaspace')
        app.listen(PORT, ()=>console.log(`Для ноутбука:http://localhost:${PORT}`))
    }
    catch(err){
        console.log(err)
    }
}
app.get('/', (req, res) => {
    res.redirect('/static/register.html');
});
app.get('/some-route', (req, res) => {
    res.send('работает')
})
start()