var sendChannel, receiveChannel;
var localPeerConnection, remotePeerConnection; // added declarations
var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");
var dataChannelSend = document.getElementById("dataChannelSend"); // cache elements
var dataChannelReceive = document.getElementById("dataChannelReceive"); // cache elements
startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;
startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;
function log(text) {
console.log("At time: " + (performance.now() / 1000).toFixed(3) +
" --> " + text);
}
function createConnection() {
// Feature/vendor detection (robust)
var RTCPeerConnectionCtor = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescriptionCtor = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidateCtor = window.RTCIceCandidate || window.mozRTCIceCandidate;
if (!RTCPeerConnectionCtor) {
alert('WebRTC is not supported by this browser.');
return;
}
// expose constructors for legacy code paths (if needed)
window.RTCPeerConnection = RTCPeerConnectionCtor;
if (RTCSessionDescriptionCtor) window.RTCSessionDescription = RTCSessionDescriptionCtor;
if (RTCIceCandidateCtor) window.RTCIceCandidate = RTCIceCandidateCtor;

log("RTCPeerConnection object: " + RTCPeerConnection);
var servers = null;
var pc_constraints = {
'optional': [
{'DtlsSrtpKeyAgreement': true}
]};
localPeerConnection = new RTCPeerConnection(servers, pc_constraints);
log("Created local peer connection object, with Data Channel");
try {
sendChannel = localPeerConnection.createDataChannel(
"sendDataChannel", {reliable: true});
log('Created reliable send data channel');
} catch (e) {
alert('Failed to create data channel!');
log('createDataChannel() failed with following message: '
+ e.message);
}
localPeerConnection.onicecandidate = gotLocalCandidate;
if (sendChannel) {
sendChannel.onopen = handleSendChannelStateChange;
sendChannel.onclose = handleSendChannelStateChange;
}
// create remote peer
window.remotePeerConnection = new RTCPeerConnection(servers, pc_constraints);
remotePeerConnection = window.remotePeerConnection;
log('Created remote peer connection object, with DataChannel');
remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
remotePeerConnection.ondatachannel = gotReceiveChannel;

// createOffer may be promise-based or callback-based on older implementations;
// try Promise approach first, fallback to callback style
if (localPeerConnection.createOffer.length === 0) {
localPeerConnection.createOffer().then(gotLocalDescription).catch(onSignalingError);
} else {
localPeerConnection.createOffer(gotLocalDescription, onSignalingError);
}

startButton.disabled = true;
closeButton.disabled = false;
}
function onSignalingError(error) {
console.log('Failed to create signaling message : ' + error.name);
}
function sendData() {
var data = document.getElementById("dataChannelSend").value;
sendChannel.send(data);
log('Sent data: ' + data);
}
function closeDataChannels() {
log('Closing data channels');
if (sendChannel) {
sendChannel.close();
log('Closed data channel with label: ' + sendChannel.label);
}
if (receiveChannel) {
receiveChannel.close();
log('Closed data channel with label: ' + receiveChannel.label);
}
if (localPeerConnection) localPeerConnection.close();
if (remotePeerConnection) remotePeerConnection.close();
localPeerConnection = null;
remotePeerConnection = null;
log('Closed peer connections');
startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;
if (dataChannelSend) dataChannelSend.value = "";
if (dataChannelReceive) dataChannelReceive.value = "";
if (dataChannelSend) {
dataChannelSend.disabled = true;
dataChannelSend.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}
}
function gotLocalDescription(desc) {
localPeerConnection.setLocalDescription(desc);
log('localPeerConnection\'s SDP: \n' + desc.sdp);
remotePeerConnection.setRemoteDescription(desc);

// createAnswer might be promise-based or callback-based; handle both
if (remotePeerConnection.createAnswer.length === 0) {
remotePeerConnection.createAnswer().then(gotRemoteDescription).catch(onSignalingError);
} else {
remotePeerConnection.createAnswer(gotRemoteDescription, onSignalingError);
}
}
function gotRemoteDescription(desc) {
remotePeerConnection.setLocalDescription(desc);
log('Answer from remotePeerConnection\'s SDP: \n' + desc.sdp);
localPeerConnection.setRemoteDescription(desc);
}
function gotLocalCandidate(event) {
log('local ice callback');
if (event.candidate) {
remotePeerConnection.addIceCandidate(event.candidate);
log('Local ICE candidate: \n' + event.candidate.candidate);
}
}
function gotRemoteIceCandidate(event) {
log('remote ice callback');
if (event.candidate) {
localPeerConnection.addIceCandidate(event.candidate);
log('Remote ICE candidate: \n ' + event.candidate.candidate);
}
}
function gotReceiveChannel(event) {
log('Receive Channel Callback: event --> ' + event);
// cross-browser: event.channel (modern) or event.dataChannel (older)
receiveChannel = event.channel || event.dataChannel;
if (!receiveChannel) return;
receiveChannel.onopen = handleReceiveChannelStateChange;
receiveChannel.onmessage = handleMessage;
receiveChannel.onclose = handleReceiveChannelStateChange;
}
function handleMessage(event) {
log('Received message: ' + event.data);
if (dataChannelReceive) dataChannelReceive.value = event.data;
if (dataChannelSend) dataChannelSend.value = '';
}
function handleSendChannelStateChange() {
var readyState = sendChannel.readyState;
log('Send channel state is: ' + readyState);
if (readyState == "open") {
if (dataChannelSend) {
dataChannelSend.disabled = false;
dataChannelSend.focus();
dataChannelSend.placeholder = "";
}
sendButton.disabled = false;
closeButton.disabled = false;
} else {
if (dataChannelSend) dataChannelSend.disabled = true;
sendButton.disabled = true;
closeButton.disabled = true;
}
}
function handleReceiveChannelStateChange() {
var readyState = receiveChannel.readyState;
log('Receive channel state is: ' + readyState);
}