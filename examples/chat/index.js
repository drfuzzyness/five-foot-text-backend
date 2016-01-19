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

var users = [
    {
        id: "u16512",
        username: "matt",
        location: {
            lat: "12.2",
            lon: "12.2"
        },
        friends: [
            "u161267"
        ]

    }
];

io.on('connection', function (socket) {
    var addedUser = false;


    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
    
        // find person to send to
    
        // can we send
    
        //send 
        if (ableToConnect(data.friend)) {
            socket.to(socket.friend).emit('new message', {
                username: socket.username,
                message: data.message
            });
        }
    });

    socket.on('register user', function (data) {
        if (findByUsername(data.username)) {
            socket.emit('error', {
                message: "Username " + data.username + " already taken. Try logging in."
            })
        } else {
            addedUser = true;
            users.push({
                id: id,
                username: data.username,
                location: data.location,
                friends: data.friends
            })
            socket.join(id);
            socket.emit('register success');
        }
    });
    
    socket.on('login', function(data) {
        var user = findByUsername(data.username);
        if (!user) {
            socket.emit('error', {
                message: "Username " + data.username + " does not exist. Try logging in."
            })
        } else {
            
        }
    });
    
    function sendToAllFriends( user, data ) {
        for( thisUser in users) {
            if( user.friend ) {
                
            }
        }
    };

});

function findUserByName(targetName) {
    for (var user in users) {
        if (user.username == targetName) {
            return user;
        }
    }
    console.log("Could not find username: " + targetName);
}