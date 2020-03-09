$(function () {
    var socket = io();
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('connection', function(username, color){
        $("#current-user").html("You are " +'<span style="color:#'+color+'">'+username+'</span>'+": ")
    });

    socket.on('new user', function( color, username){
        $('#messages').append($('<li>').html('<span style="color:#'+color+';font-weight:bold">'+username+'</span>'+" has joined the chat"));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    })

    socket.on('left user', function( color, username){
        $('#messages').append($('<li>').html('<span style="color:#'+color+';font-weight:bold">'+username+'</span>'+" has left the chat"));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    })

    socket.on('update userlist', function(userList){
        $("#users").empty();
        for(var x=0; x<userList.length; x++){
            $('#users').append($('<li>').html(userList[x].username));
        }
    })

    socket.on('invalid color', function(color){
        var msg = "Sorry, "+color+"is not a valid hex color"
        $('#messages').append($('<li>').html(msg));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    })

    socket.on('valid color', function(color){
        var msg = "Your color has been updated to "+'<span style="color:#'+color+'">'+color+'</span>'
        $('#messages').append($('<li>').html(msg));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    })

    socket.on('username taken', function(username){
        var msg = " Sorry, "+username+" has already been taken"
        $('#messages').append($('<li>').html(msg));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    })

    socket.on('username changed', function(newName, oldName, color){
        var msg = '<span style="color:#'+color+'">'+oldName+'</span>'+" has changed their name to "+
        '<span style="color:#'+color+'">'+newName+'</span>';
        $('#messages').append($('<li>').html(msg));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    })

    socket.on('chat message', function(msg, time, username,color){
        msg = '<span style="font-family:Courier New" >'+ time+'</span>'+" "+
        '<span style="color:#'+color+'">'+username+'</span>'+": "+
        msg;
        $('#messages').append($('<li>').html(msg));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    });

    socket.on('bold chat message', function(msg, time, username,color){
        msg = '<span style="font-family:Courier New;font-weight: bold;" >'+ time+'</span>'+" "+
        '<span style="color:#'+color+';font-weight: bold;">'+username+'</span>'+": "+
        '<span style="font-weight: bold;">'+msg+'</span>';
        $('#messages').append($('<li>').html(msg));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    });

    socket.on('chat history', function(chatLog){
        if(chatLog!=[]){
            for(var x=0; x<chatLog.length;x++){
                var message = '<span style="font-family:Courier New" >'+ chatLog[x].time+'</span>'+" "+
                '<span style="color:#'+chatLog[x].color+'">'+ chatLog[x].username+'</span>'+": "+
                chatLog[x].message;
                $('#messages').append($('<li>').html(message));
                $("#chat").scrollTop($("#chat")[0].scrollHeight);
            }
        }
    });
});
