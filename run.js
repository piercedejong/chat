var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var totalUsers = 0
var userList = []
var chatLog = []

app.get('/', function(req, res){res.sendFile(__dirname + '/index.html')});
app.use("/styles",express.static(__dirname + "/styles"));
app.use("/js",express.static(__dirname + "/js"));


io.on('connection', function(socket){
    totalUsers++;
    socket.username = "User "+totalUsers
    socket.color = Math.floor(Math.random()*16777215).toString(16);
    userList.push({username: socket.username, color: socket.color});
    socket.emit("chat history", chatLog);
    socket.emit("connection", socket.username, socket.color);
    io.emit('new user', socket.color, socket.username)
    io.emit('update userlist', userList)

    socket.on('disconnect', function(){
        for(var i= 0; i<userList.length; i++){
            if ( userList[i].username === socket.username) {
                io.emit('left user', userList[i].color, userList[i].username)
                userList.splice(i, 1);
            }
        }
        io.emit('update userlist', userList)
    });

    socket.on('chat message', function(msg){
        var time = new Date()
        time = time.getHours()+":"+time.getMinutes()

        if(msg.startsWith("/nick ")){
            console.log("hello")
            var newName = msg.slice(6);
            console.log(newName)
            var nameTaken = false
            for(var i= 0; i<userList.length; i++){
                if ( userList[i].username === newName) {
                    taken = true;
                }
            }
            if(nameTaken){
                console.log("taken")
                socket.emit("username taken", newName, time)
            }else{
                for(var i= 0; i<userList.length; i++){
                    if ( userList[i].username === socket.username) {
                        console.log(newName)
                        io.emit('username changed', newName, socket.username, socket.color, time)
                        userList[i].username = newName;
                        socket.username = newName;
                        io.emit('update userlist', userList);
                        socket.emit("connection", socket.username, socket.color);
                    }
                }
            }

        }else if(msg.startsWith("/nickcolor ")){
            color = msg.slice(11)
            if(/^#[0-9A-F]{6}$/i.test('#'+color)){
                socket.color= color
                socket.emit("connection", socket.username, socket.color);
                for(var i= 0; i<userList.length; i++){
                    if ( userList[i].username === socket.username) {
                        userList[i].color = color;
                        socket.emit("valid color", color)
                    }
                }

            }else{
                socket.emit("invalid color", color)
            }


        }else{
            chatLog.push({message: msg, username: socket.username, color: socket.color, time: time})
            if (chatLog.length === 200){
                chatLog.shift();
            }
            socket.broadcast.emit('chat message', msg,time, socket.username, socket.color);
            socket.emit('bold chat message', msg,time, socket.username, socket.color);
        }
    });
});

http.listen(port, function(){
  console.log('listening on *:'+ port);
});
