$(function () {
    var FADE_TIME = 150; // ms
    var SERVER_URL = "http://172.26.101.113:3000/";
    // var SERVER_URL = "http://localhost:3000/";

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('#usernameInput'); // Input for username
    var $registerUsernameInput = $('#registerUsernameInput');
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $setNamesButton = $('#setNamesButton');
    
    var $chatPage = $('#conversation');
    var $CPsendMessageInterface = $('#conversation.bottom-bar.sendMessageInterface');
    var $CPunavaliableInterface = $('#conversation.bottom-bar.unavaliableInterface');
    var $CPyourUsername = $('#conversation.chatArea.your-name.username');
    
    var $conversationListPage = $('#conversation-list');
    var $CLfriendInput = $('#friendInput');
    // var $CLfriendInput = $('#addFriendButton');
    var $CLfriendList = $('#contacts-list');
    
    var $loginPage = $('#setup'); // The login page
    
    

    // Prompt for setting a username
    var username;
    var currentFriend;
    // var friends = [];
    var connected = false;
    // var $currentInput = $usernameInput.focus();

    var socket = io.connect( SERVER_URL );
    
    socket.on('connect', function() {
       // deactivate no-connection errors
       
       // attempt to login
        if( localStorage.username != undefined ) {
            console.log("Trying to login with found username " + localStorage.username );
            socket.emit("login", {
                username: localStorage.username
            });
        } else {
            console.log("Not logged in.")
            openLoginPage();
        }
        
        updateLocationEveryFiveSeconds();
    });
    
    function onLoad() {
        
    }
    
    function openContactListPage() {
        $loginPage.removeClass("active");
        $chatPage.removeClass("active");
        $conversationListPage.addClass("active");
        refreshContactListPage();
    }
    
    function openConversationPage() {
        $loginPage.removeClass("active");
        $chatPage.addClass("active");
        $conversationListPage.removeClass("active");
        refreshConversationPage();
    }
    
    function openLoginPage() {
        $loginPage.addClass("active");
        $chatPage.removeClass("active");
        $conversationListPage.removeClass("active");
        refreshLoginPage();
    }
    
    function refreshContactListPage() {
        console.log("Refreshing login page");
        // Refresh current username
        
        // Refresh current contacts list & avaliability from server
        // Write contact list
    }
    
    function refreshConversationPage() {
        // update friend name
        console.log( "Getting friendslist");
        socket.emit("get friendslist");
        // Refresh current username 
        // get conversation from storage
    }
    
    function refreshLoginPage() {
        
    }
    
    
    function onRegister() {
        username = cleanInput($usernameInput.val().trim());
        if( username ) {
            connected = true;
            socket.emit('register', {
                username: username
            });
        }  
    }
    
    function onAddFriend() {
        var friend = cleanInput($('#friendInput').val().trim());
        console.log( "Adding Friend: " + friend );
        if( friend ) {
            
            socket.emit( "add friend", {
                friend: friend
            });
        }
    }
    
    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message) {
            // $inputMessage.val('');
            // addChatMessage({
            //     username: username,
            //     friend: friend,
            //     location: location,
            //     message: message
            // });
            // tell server to execute 'new message' and send along one parameter
            // alert( message );
            socket.emit('send message', {
                message: message,
                targetUser: currentFriend
            });
        }
    }

    // Log a message
    // function log(message, options) {
    //     var $el = $('<li>').addClass('log').text(message);
    //     addMessageElement($el, options);
    // }
    
    function addChatMessage(data, options) {

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        // var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }


    function updateLocationEveryFiveSeconds(){
        // alert("stating update location");
        // console.log( "currently connected: " + connected );
        if( connected ) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {});
            }
            
        }
            // alert("set callbax");
            
        
        setTimeout(updateLocationEveryFiveSeconds, 5000);
    }
    
    function successCallback(currentPosition) {
        var lat = currentPosition.coords.latitude;
        var lon = currentPosition.coords.longitude;
        socket.emit('update location', {
            lat: lat,
            lng: lon
        });
        // console.log( "updated location " + lat + ", " + lon );
        // alert("sent location");
    }
    
    function errorCallback(e) {
        alert(e);
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            // $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }
    

    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }
    
    $("#sendMessageButton").click(function() {
        sendMessage();
    });
    
    $("#changeNameButton").click(function() {
        onRegister();
    });
    
    $("#setNamesButton").click(function(){
        username = cleanInput($('#registerUsernameInput').val().trim());
        if( username ) {
            connected = true;
            socket.emit('register', {
                username: username
            });
        }  
    });
    
    $("#addFriendButton").click(function() {
        onAddFriend();
    });
    
    $("#refreshFriendsList").click(function(){
       refreshConversationPage(); 
    });
    
    socket.on('login result', function (data) {
        if( data.success ) {
            connected = true;
            username = data.username;
            console.log( "Logged in as: " + data.username );
            // Display the welcome message
            openContactListPage();
            
        } else {
            alert( "Login Fail: " + data.errorMessage);
            openLoginPage();
        }
    });
    
    socket.on( 'available', function(data){
        
    });
    
    socket.on( 'friendslist', function(data) {
        $CLfriendList.empty();
        console.log( data );
        if( data.size() == 0 ) {
            console.log("You have no friends.");
            
        } else {
            for( var friend in data ){
                console.log( "Got friend " + friend.friendName );
                    var $usernameDiv = $('<span class="name"/>')
                        .text( friend.friendName )
                    var $statusDiv = $('<span class="status">')
                        .text( friend.friendAvaliability );

                    // var typingClass = data.typing ? 'typing' : '';
                    var $contactLi = $('<li class="contact"/>')
                        .data('friendName', friend.friendName)
                        .append($usernameDiv, $statusDiv)
                        .click(function() {
                            console.log( "Opening conversation between" + friend.friendName );
                            currentFriend = friend.friendName;
                            openConversationPage();
                        });

                    $CLfriendList.append($contactLi);
            } 
        }
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('incoming message', function (data) {
        console.log("got message " + data)
        addChatMessage(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('register result', function (data) {
        console.log( "register result" + data );
        if( data.success ) {
            username = data.username;
            localStorage.username = username;
            connected = true;
            openContactListPage();
        } else {
            alert( "Register Fail: " + data.errorMessage );
            openLoginPage();
        }
    });
    
    $( document ).ready(function() {
        onLoad();
    });
});
