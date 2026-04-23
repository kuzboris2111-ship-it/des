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
io.on('connection', (socket) => {
    console.log('User connect')

    socket.on('join-group', (groupId) => {
        socket.join(groupId)
        console.log(`Пользователь присоединился к группе ${groupId}`)
    })

    socket.on('draw', (data) => {
        socket.to(data.groupId).emit('draw', data)
    })
})

io.on('connection', (socket) => {
    socket.on('join-group', (groupId) => {
        socket.join(groupId)
    })
})
//-------------------------------------------------------
const start=async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/orgaspace')
        server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен:`)
    console.log(`Локально: http://localhost:${PORT}`)
    console.log(`По Wi-Fi: http://192.168.0.148:${PORT}`)
    console.log(`По Wi-Fi: http://10.2.0.233:${PORT}`)
})
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