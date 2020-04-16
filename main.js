const socket = io('https://limitless-cove-32591.herokuapp.com');
var check;
var txtUsername = document.getElementById('txtUsername');
var txtMessage = document.getElementById('txtMessage');
var btnSend = document.getElementById('btnSend');
var output = document.getElementById('output');
var liArr = [];

$('#chat-zone').hide();

txtMessage.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   btnSend.click();
  }
});
btnSend.addEventListener('click', () => {
    socket.emit('AI_DO_VUA_NHAN_TIN', {
            username: txtUsername.value,
            message: txtMessage.value
        })
    });
socket.on('AI_DO_VUA_NHAN_TIN', data => {
    output.innerHTML += "<p><strong>" + data.username + "</strong>" + " : " + data.message + "</p>";
    txtMessage.value = "";
});

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#chat-zone').show();
    $('#register-zone').hide();
    arrUserInfo.forEach(user => {
        const {ten, peerId} = user;
        $('#listUser').append(`<li id="${peerId}">${ten}</li>`);
    });
});
socket.on('AI_DO_NGAT_KET_NOI', peerId => {
    liArr.pop();
    $(`#${peerId}`).remove();  
});

socket.on('CO_NGUOI_DUNG_MOI', user => {
    liArr.push(user.peerId);
    const {ten, peerId} = user;
    $('#listUser').append(`<li id="${peerId}">${ten}</li>`);
    console.log(liArr);
});
socket.on('DANG_KY_THAT_BAI', () => alert("Vui long chon username khac !"));
// Get Media Stream
function OpenStream(){

    const config = {audio: true, video: true};
    //Get Screen Media
    if (check == 1){
        return navigator.mediaDevices.getDisplayMedia(config);
    }
    // Get Camera Video Media
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// setup server
var peer = new Peer({
    key: 'peerjs',
    host:'mypeer.herokuapp.com',
    secure: true,
    port: 443
});
// Create Id to conncet
peer.on('open', function(id) {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        document.styleSheets[0].disabled = true;
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KI', { ten : username, peerId: id});
        OpenStream()
        .then(stream => {
            playStream('localStream', stream);
        });
    });
    document.getElementById('btnJoin').addEventListener('click', function (){
        document.styleSheets[0].disabled = true;
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KI', { ten : username, peerId: id});
        peerId = document.getElementById('txtRoomId').value;
        OpenStream()
        .then(stream => {
            playStream('localStream', stream);
                const call = peer.call(peerId, stream);

                call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
                
        });
    });
    console.log('My peer ID is: ' + id);
});

peer.on('call', call => {
    OpenStream()
    .then(stream => {
        call.answer(stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Called
// $('#btnCall').click(() => {
//     const id = $('#remoteId').val();
//     peid = id;
//     OpenStream()
//     .then(stream => {
//         playStream('localStream', stream);
//         const call = peer.call(id, stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream)); 
//     })    
// });
// wait for another connect

// Call by Click to User
$('#listUser').on('click','li', function () {
    const id = ($(this)).attr('id');
    OpenStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream)); 
    })    
});
// Share Screen
$('#share').click(() => {
    const title = $('#my-peer').text();
    const id = title.substring(8);
    check = 1;
    console.log(check);
    OpenStream()
    .then(stream => {
        playStream('localStream', stream);
        liArr.forEach( peerId => {
            const call = peer.call(peerId, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        });
    });
});