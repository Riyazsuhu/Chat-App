const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const path=require('path')
const Filter=require('bad-words')
const {generateMessage}=require('./utils/message')
const {createUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT||3000
const publicDirectory=path.join(__dirname,'../public')
app.use(express.static(publicDirectory))
io.on('connection',(socket)=>{
    console.log('New socket connection')
    socket.on('join',(options,callback)=>{
        const{error,user}=createUser({id:socket.id,...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin',`Welcome! ${user.username}`))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('profinity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback() 
    })

    socket.on('sendLocation',(message,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateMessage(user.username,message))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} is left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            }) 
        }
    })
})
server.listen(port,()=>{
    console.log(`Chat-App stated on port ${port}!`)
})
