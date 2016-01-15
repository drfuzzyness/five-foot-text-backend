// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;
var REQUIRED_DISTANCE = 5;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

var users = [
    {
        id: "u16512",
        username: "matt",
        location: {
            lat: "12.2",
            lon: "12.2"
        },
        
    },
    {
        id: "u125125",
        username: "dan",
        location: {
            lat: "12.2",
            lon: "12.2"
        }
    }
];

io.on('connection', function (socket) {
    var addedUser = false;
    // username: socket.username,
    // friend: socket.friend,
    // location: socket.location,
    // message: data

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.to(socket.friend).emit('new message', {
            username: socket.username,
            friend: socket.friend,
            location: socket.location,
            message: data.message
        });
    });
    
    

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (data) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = data.username;
        socket.friend = data.friend;
        socket.location = data.location;
        
        socket.join(socket.username);
        ++numUsers;
        addedUser = true;
        
        users.push({
            id: id,
            username: data.username,

            location: data.location
        });
        
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.to(socket.friend).emit('user joined', {
            username: socket.username,
            friend: socket.friend,
            location: socket.location,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.to(socket.friend).emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.to(socket.friend).emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.to(socket.friend).emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
    
    function isWithinDistance( user ) {
        if( user ) {
            if( user) {
                
            }
        }
    }
});

function findUserByName( targetName ) {
    for( var user in users ) {
        if( user.username == targetName ) {
            return user;
        }
    }
    console.log( "Could not find username: " + targetName );
}

