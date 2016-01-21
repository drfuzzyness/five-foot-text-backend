var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;

var ARBITRARY_HIGH_NUMBER = 990390424;
var AVALIABILITY_DISTANCE = 10;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var redis = require("redis"),
    client = redis.createClient();

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

    console.log("New user has connected.");
    socket.on('register', function (data) {
        usernameIsAvailable(data.username, function(available) { 
            if (available){
                console.log("New user registered in with username " + data.username);
                var newUser = {
                    username: data.username,
                    lat: 0.0,
                    lng: 0.0,
                    friends: []
                }
                socket.username = data.username;
                client.rpush('users-data', JSON.stringify(newUser));
                socket.emit('register result', {
                    username: data.username,
                    success: true,
                });
            } else {
                socket.emit('register result', {
                    username: data.username,
                    success: false,
                    errorMessage: "Username taken."
                });
            }
        });
    });

    socket.on('login', function (data) {
        usernameIsAvailable(data.username, function(available) { 
            if (!available){
                console.log("New user logged in with username " + data.username);
                socket.emit('login result', {
                    username: socket.username,
                    success: true,
                });
                socket.username = data.username;
            } else {
                socket.emit('login result', {
                    username: socket.username,
                    success: false,
                    errorMessage: "Username does not exist"
                });
            }
        });
    });

    socket.on('send message', function (data) {
        console.log(socket.username + " sent a message " + data.message + " from location (" + socket.lat + "),(" + socket.lng + ")" );
        socket.to(data.friend).emit('incoming message', {
            username: socket.username,
            friend: socket.friend,
            location: socket.location,
            message: data.message
        });
    });

    var count;
    socket.on('update location', function (data) {
        socket.lat = data.lat;
        socket.lng = data.lng;
        getUserIndex(socket.username, function(index) { 
            if( index == -1) {
                return;
            }
            var currentUserInfoUpdated = {username: "", lat: 0.0, lng: 0.0, friends: []};
            var currentUserInfoUpdated;
            client.lindex('users-data', index, function (err, reply) {
                currentUserInfoOld = JSON.parse(reply);
                currentUserInfoUpdated = currentUserInfoOld;
                currentUserInfoUpdated.lat = data.lat;
                currentUserInfoUpdated.lng = data.lng;
                var sendme = JSON.stringify(currentUserInfoUpdated);
                client.lset('users-data', index, sendme , function(err, reply) { 
                    console.log(socket.username + " has updated location at (" + data.lat + "),(" + data.lng + ")");
                });
            });
            

        });
        
    });

    socket.on('add friend', function (data){
        getUserIndex(socket.username, function(index) { 
            var currentUserInfoUpdated = {username: "", lat: 0.0, lng: 0.0, friends: []};
            client.lindex('users-data', index, function (err, reply) {
                currentUserInfoOld = JSON.parse(reply);
                currentUserInfoUpdated = currentUserInfoOld;
                if (index != -1){
                    getUserIndex(data.friend, function(friendIndex) {
                        if( friendIndex == -1 ) {
                            socket.emit('add friend result', {
                                friendAdded: false,
                                errorMessage: "Friend username could not be found"
                            });
                        } else {
                            currentUserInfoUpdated.friends.push(data.friend);
                            var sendme = JSON.stringify(currentUserInfoUpdated);
                            console.log("User and added to friends list");
                            client.lset('users-data', index, sendme, function(err, reply) {
                                socket.emit('add friend result', {
                                    friendAdded: true,
                                    errorMessage: null
                                });
                            });
                        }
                    });
                } else {
                    console.log("User not found");
                    socket.emit('add friend result', {
                        friendAdded: false,
                        errorMessage: "Could not find self"
                    });
                }
            });
        });
    });

    socket.on('get friendslist', function (data) {
        getUserIndex(socket.username, function(index) { 
            client.lindex('users-data', index, function (err, reply) {
                currentUser = JSON.parse(reply);
                console.log(socket.username + " has " + currentUser.friends.length + " friends");
                var friends = currentUser.friends;
                var compiledFriendsList = [];
                client.lrange('users-data', 0, ARBITRARY_HIGH_NUMBER, function(err1, allUserArray){
                    for( var userJson in allUserArray ) {
                        var thisFriend = JSON.parse( userJson );
                        for( var thisFriendName in friends ) {
                            if( thisFriend.username == thisFriendName ) {
                                console.log( "friend " + thisFriendName + " found");
                                var distance = getDistanceFromLatLonInKm( 
                                                    currentUser.lat, currentUser.lon,
                                                    thisFriend.lat, thisFriend.lon );
                                var available = distance < AVALIABILITY_DISTANCE;
                                if (distance < AVALIABILITY_DISTANCE) { available = true;} else { available = false;}
                                compiledFriendsList.push( {
                                    friendName: thisFriend.username,
                                    friendAvaliability: available
                                });
                            }
                            
                        }

                    }
                    console.log( JSON.stringify(compiledFriendsList) );
                    socket.emit('friendslist', compiledFriendsList );
                });
                for (var i=0; i<friends.length; i++){
                    // var currentFriendLat;
                    // var currentFriendLat;
                    // getUserIndex(friends[i], function(index) { 
                    //     client.lindex('users-data', index, function (err, reply) {
                    //         currentUserInfoOld = JSON.parse(reply);
                    //         // currentUserInfoUpdated = currentUserInfoOld;
                    //         var sendme = JSON.stringify(currentUserInfoUpdated);
                    //         client.lset('users-data', index, sendme , function(err, reply) { 
                    //             console.log(socket.username + " has updated location at (" + data.lat + "),(" + data.lng + ")");
                    //         });
                    //     });
                    // });
                }
                console.log(currentUser.friends);
                for (var i=0; i<currentUser.friends.length; i++){
                    console.log(currentUser.friends[i]);
                    isFriendAccessible(currentUser.friends[i], function(accessible){
                        if (accessible) {
                            friends.push({
                                friendName: currentUser.friends[i],
                                friendAvailability: true
                            });
                        } else {
                            friends.push({
                                friendName: currentUser.friends[i],
                                friendAvailability: false
                            });
                        }
                    });
                }
                console.log(friends);
                socket.emit('friendslist', friends);
            });
        });
    });

    function getUserIndex(username, cb){
        var numUsers;
        client.llen('users-data', function (err, reply) {
            numUsers = reply;
            client.lrange('users-data', 0, ARBITRARY_HIGH_NUMBER, function( err, reply ) {
                for (var i = 0; i < numUsers; i++){
                    var thisUser = JSON.parse(reply[i]);
                    if (username == thisUser.username){
                        cb(i);
                        return;
                    }
                }
                cb(-1);
                return;
            });
        });    
    }

    function isValidFriendAndReturnAsUserObject(friend) {
        for (var i=0; i<users.length; i++) {
            console.log(users[i].username);
            if ((socket.username != friend) && (friend === users[i].username)) {
                return user;
            }
        }
        return null;
    }

    function isFriendAccessible(friend, cb) {
        getUserIndex(friend, function(index) { 
            client.lindex('users-data', index, function (err, reply) {
                friend_lat = reply.lat;
                friend_lng = reply.lng;
                if (getDistanceFromLatLonInKm(friend_lat, friend_lng, socket.lat, socket.lng) < 10){
                    cb(true);
                    return;
                } else {
                    cb(false);
                    return;
                }
            });
        });
    }

    function addFriend(friend) {
        console.log(socket.username + " is trying to add " + friend + " as a friend.");
        var potentialFriend = isValidFriendAndReturnAsUserObject(friend);
        if (potentialFriend !== null) {
            getUserByUsername(socket.username).friends.push(friend); 
        } else {
            console.log("Could not find person with that username!");
        }
    }

    function usernameIsAvailable(username, cb) {
        var numUsers;
        client.llen('users-data', function (err, reply) {
            numUsers = reply;
            for (var i=0; i<numUsers; i++){
                client.lindex('users-data', i, function (err, reply) {
                    var currentUser = JSON.parse(reply);
                    if (username == currentUser.username){
                        cb(false);
                    }
                });
            }
            cb(true);
        }); 
    }

    function isValidFriend(data) {
        console.log(socket.username + " is trying to add " + data.friend);
        if (socket.username != data.friend){
            return true;
        } else {
            return false;
        }
    }

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; 
        var dLat = deg2rad(lat2-lat1);  
        var dLon = deg2rad(lon2-lon1); 
        var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; 
        return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
});