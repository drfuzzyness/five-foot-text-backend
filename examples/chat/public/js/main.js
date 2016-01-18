$(function () {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('#usernameInput'); // Input for username
    var $registerUsernameInput = $('#registerUsernameInput');
    var $friendInput = $('#friendInput');
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $setNamesButton = $('#setNamesButton');
    
    // var $chatPage = $('.conversation');
    // $chatPage.$sendMessageInterface = $('.bottom-bar.sendMessageInterface');
    // $chatPage.$unavaliableInterface = $('.bottom-bar.unavaliableInterface');
    // $chatpage.$yourUsername = $('chatArea.your-name.username');
    
    var $conversationListPage = $('#conversation-list');
    
    var $loginPage = $('#setup'); // The login page
    
    

    // Prompt for setting a username
    var username;
    var currentFriend;
    var friends = [];
    var connected = false;
    // var $currentInput = $usernameInput.focus();

    var socket = io.connect('http://172.26.101.113:3000/');
    
    function onLoad() {
        updateLocationEveryFiveSeconds();
    }
    
    function openContactListPage() {
        $loginPage.removeClass("active");
        // $chatPage.removeClass("active");
        $conversationListPage.addClass("active");
    }

    // Sets the client's username
    // function setUsername() {
    //     username = cleanInput($usernameInput.val().trim());
    //     friend = cleanInput($friendInput.val().trim());
        
    //     localStorage.setItem( "username", username );
    //     // If the username is valid
    //     if (username && friend) {
    //         $loginPage.removeClass('active');
    //         $chatPage.addClass('active');
    //         // $loginPage.off('click');
    //         // $currentInput = $inputMessage.focus();

    //         // Tell the server your username
    //         socket.emit('add user', {
    //             username: username,
    //             friend: friend,
    //             location: location
    //         });
    //     }
    // }
    
    
    
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
        var friend = cleanInput($friendInput.val().trim());
        
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
                targetUser: "currentFriend"
            });
        }
    }

    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }
    
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
        console.log( "currently connected: " + connected );
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
        console.log( "updated location " + lat + ", " + lon );
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
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }
    
    function addFriends() {
        
    }

    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }
    
    $("#sendMessageButton").click(function() {
        
        sendMessage();
    });
    
    $("#changeNameButton").click(function() {
        onRegister();
    })
    
    socket.on('login result', function (data) {
        if( data.success ) {
            connected = true;
            
            // Display the welcome message
            displayConnectionSuccess();
        } else {
            alert(data.errorMessage);
        }
    });
    
    socket.on( 'available', function(data){
        
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('incoming message', function (data) {
        console.log("got message " + data)
        addChatMessage(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('register result', function (data) {
        if( data.success ) {
            username = data.username;
            connected = true;
            // openContactListPage();
        } else {
            alert( data.errorMessage );
        }
    });
    
    $( document ).ready(function() {
        onLoad();
    });
});
