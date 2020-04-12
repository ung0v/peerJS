const socket = io('https://limitless-cove-32591.herokuapp.com');

$('#chat-zone').hide();

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#chat-zone').show();
    $('#register-zone').hide();
    arrUserInfo.forEach(user => {
        const {ten, peerId} = user;
        $('#listUser').append(`<li id="${peerId}">${ten}</li>`);
    });
});
socket.on('AI_DO_NGAT_KET_NOI', peerId => {
    $(`#${peerId}`).remove();
});

socket.on('CO_NGUOI_DUNG_MOI', user => {
    const {ten, peerId} = user;
    $('#listUser').append(`<li id="${peerId}">${ten}</li>`);
});
socket.on('DANG_KY_THAT_BAI', () => alert("Vui long chon username khac !"));
function OpenStream(){
    const config = {audio: false, video: true};
    return navigator.mediaDevices.getUserMedia(config);
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
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KI', { ten : username, peerId: id});
        
    });
    console.log('My peer ID is: ' + id);
  });

//Called

$('#btnCall').click(() => {
    const id = $('#remoteId').val();
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