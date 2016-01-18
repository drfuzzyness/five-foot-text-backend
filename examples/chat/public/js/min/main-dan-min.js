function addParticipantsMessage(e){var n="";n+=1===e.numUsers?"there's 1 participant":"there are "+e.numUsers+" participants",log(n)}function setUsername(){username=cleanInput($usernameInput.val().trim()),friend=cleanInput($friendInput.val().trim()),username&&($loginPage.fadeOut(),$chatPage.show(),$loginPage.off("click"),$currentInput=$inputMessage.focus(),socket.emit("add user",{username:username,friend:friend,location:userLocation}))}function sendMessage(){var e=$inputMessage.val();e=cleanInput(e),e&&connected&&($inputMessage.val(""),addChatMessage({username:username,friend:friend,location:userLocation,message:e}),socket.emit("new message",{message:e,friend:friend}))}function log(e,n){var t=$("<li>").addClass("log").text(e);addMessageElement(t,n)}function addChatMessage(e,n){var t=getTypingMessages(e);n=n||{},0!==t.length&&(n.fade=!1,t.remove());var a=$('<span class="username"/>').text(e.username).css("color",getUsernameColor(e.username)),s=$('<span class="messageBody">').text(e.message),i=e.typing?"typing":"",o=$('<li class="message"/>').data("username",e.username).addClass(i).append(a,s);addMessageElement(o,n)}function addChatTyping(e){e.typing=!0,e.message="is typing",addChatMessage(e)}function removeChatTyping(e){getTypingMessages(e).fadeOut(function(){$(this).remove()})}function addMessageElement(e,n){var t=$(e);n||(n={}),"undefined"==typeof n.fade&&(n.fade=!0),"undefined"==typeof n.prepend&&(n.prepend=!1),n.fade&&t.hide().fadeIn(FADE_TIME),n.prepend?$messages.prepend(t):$messages.append(t),$messages[0].scrollTop=$messages[0].scrollHeight}function cleanInput(e){return $("<div/>").text(e).text()}function updateTyping(){connected&&(typing||(typing=!0,socket.emit("typing")),lastTypingTime=(new Date).getTime(),setTimeout(function(){var e=(new Date).getTime(),n=e-lastTypingTime;n>=TYPING_TIMER_LENGTH&&typing&&(socket.emit("stop typing"),typing=!1)},TYPING_TIMER_LENGTH))}function getTypingMessages(e){return $(".typing.message").filter(function(n){return $(this).data("username")===e.username})}function getUsernameColor(e){for(var n=7,t=0;t<e.length;t++)n=e.charCodeAt(t)+(n<<5)-n;var a=Math.abs(n%COLORS.length);return COLORS[a]}function sendMessage(){var e=io.connect("http://172.26.101.113:3000/");message=document.getElementById("inputMessage").value,e.emit("new message",{message:message,lat:localStorage.lat,lng:localStorage.lng})}function isFriendAccessible(e){}var socket=io.connect("http://172.26.101.113:3000/");alert("I am here now");var FADE_TIME=150,TYPING_TIMER_LENGTH=400,COLORS=["#e21400","#91580f","#f8a700","#f78b00","#58dc00","#287b00","#a8f07a","#4ae8c4","#3b88eb","#3824aa","#a700ff","#d300e7"];alert("I made it past the capitals");var $usernameInput=document.getElementById(".usernameInput"),$friendInput=document.getElementById(".friendInput"),$messages=document.getElementById(".messages"),$inputMessage=document.getElementById(".inputMessage"),username,friend,userLocation,connected=!1,typing=!1,lastTypingTime,$currentInput=$usernameInput.focus();setInterval(function e(){userLocation=localStorage.location,alert(userLocation)},5e3),$window.keydown(function(e){e.ctrlKey||e.metaKey||e.altKey||$currentInput.focus(),13===e.which&&(username?(sendMessage(),socket.emit("stop typing"),typing=!1):setUsername())}),$inputMessage.on("input",function(){updateTyping()}),$loginPage.click(function(){$currentInput.focus()}),$inputMessage.click(function(){$inputMessage.focus()}),socket.on("login",function(e){connected=!0;var n="Welcome to Socket.IO Chat – ";log(n,{prepend:!0}),addParticipantsMessage(e)}),socket.on("new message",function(e){addChatMessage(e)}),socket.on("user joined",function(e){log(e.username+" joined"),addParticipantsMessage(e)}),socket.on("user left",function(e){log(e.username+" left"),addParticipantsMessage(e),removeChatTyping(e)}),socket.on("typing",function(e){addChatTyping(e)}),socket.on("stop typing",function(e){removeChatTyping(e)});