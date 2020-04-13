const socket = io('https://limitless-cove-32591.herokuapp.com');

var check;

var txtUsername = document.getElementById('txtUsername');
var txtMessage = document.getElementById('txtMessage');
var btnSend = document.getElementById('btnSend');
var output = document.getElementById('output');
    btnSend.addEventListener('click', () => {
        socket.emit('AI_DO_VUA_NHAN_TIN', {
            username: txtUsername.value,
            message: txtMessage.value
        })
    });
socket.on('AI_DO_VUA_NHAN_TIN', data => {
    output.innerHTML += "<p><strong>" + data.username + "</strong>" + " : " + data.message + "</p>";  
});
$('#chat-zone').hide();
var liArr = [];
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
function OpenStream(){
    console.log(check);
    if (check == 1){
        return navigator.mediaDevices.getDisplayMedia({
            video: true
        });
    }
    const config = {audio: true, video: true};
    return navigator.mediaDevices.getUserMedia(config);
}
function OpenMediaStream(){
    return navigator.mediaDevices.getDisplayMedia({
        video: true
    });
}
function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}
// OpenStream()
// .then(stream => playStream('localStream', stream));

var peer = new Peer({
    key: 'peerjs',
    host:'mypeerhost.herokuapp.com',
    secure: true,
    port: 443
});

peer.on('open', function(id) {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        document.styleSheets[0].disabled = true;
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KI', { ten : username, peerId: id});
        
    });
    console.log('My peer ID is: ' + id);
  });
  
//Called
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    peid = id;
    OpenStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream)); 
    })    
});

peer.on('call', call => {
    OpenStream()
    .then(stream => {
        console.log(stream);
        call.answer(stream);
        playStream('localStream',stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});


$('#listUser').on('click','li', function () {
    const id = ($(this)).attr('id');
    OpenStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream)); 
    })    
});
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
// function onAccessApproved(id) {
//   if (!id) {
//     console.log("Access rejected");
//     return;
//   }
//   navigator.webkitGetUserMedia({                                                                                                                                                                                                              
//       audio: false,
//       video: { mandatory: { chromeMediaSource: "desktop",
//                             chromeMediaSourceId: id, 
//                             maxWidth: screen.width,
//                             maxHeight: screen.height,
//                             minFrameRate: 1,
//                             maxFrameRate: 5 }}
//   }, gotStream, getUserMediaError);
// }

// document.querySelector('#share').addEventListener('click', function(e) {
//   pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
//       ["screen", "window"], onAccessApproved);
// });