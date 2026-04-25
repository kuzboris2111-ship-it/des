const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const authRouter = require('./authRouter')
const groupRouter = require("./groupRouter")
const multer = require('multer')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const PORT = 3000

app.use(express.json())
app.use('/static', express.static(path.join(__dirname, '../static')))
app.use('/auth', authRouter)
app.use('/groups', groupRouter)

io.on('connection', (socket) => {
    console.log('User connect')

    socket.on('join-group', ({ groupId, folderId }) => {
        const room = `${groupId}_${folderId}`
        socket.join(room)
        console.log(`Socket ${socket.id} присоединился к комнате ${room}`)
    })

    socket.on('draw', (data) => {
        socket.to(`${data.groupId}_${data.folderId}`).emit('draw', data)
    })

    socket.on('chat-message', async (data) => {
        io.to(`${data.groupId}_${data.folderId}`).emit('chat-message', data)
    })
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/orgaspace')
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Сервер запущен: http://localhost:${PORT}`)
            console.log(`ПО WI-FI: http://192.168.0.148:${PORT}`)
        })
    } catch (err) {
        console.log(err)
    }
}

app.get('/', (req, res) => {
    res.redirect('/static/register.html')
})

app.get('/some-route', (req, res) => {
    res.send('работает')
})

start()