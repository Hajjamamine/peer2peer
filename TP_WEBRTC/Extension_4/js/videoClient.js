const localVideo = document.getElementById('localVideo');
const videosDiv = document.getElementById('videos');

let localStream;
const peers = {}; // map peerId -> RTCPeerConnection

(async () => {
    const socket = io.connect('http://localhost:8181');
    const channel = "default"; // canal fixe pour tous

    // Récupérer la webcam et le micro
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    localVideo.srcObject = localStream;

    // Rejoindre le canal
    socket.emit('join', channel);

    // Peers existants
    socket.on('existing-peers', (peerIds) => {
        peerIds.forEach(peerId => createPeerConnection(peerId, socket, true));
    });

    // Nouveau peer rejoint
    socket.on('new-peer', (peerId) => {
        createPeerConnection(peerId, socket, false);
    });

    // Signal reçu
    socket.on('signal', async (data) => {
        const pc = peers[data.sender];
        if(!pc) return;
        await pc.setRemoteDescription(data.signal);
        if(data.signal.type === 'offer'){
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('signal', { target: data.sender, signal: pc.localDescription });
        }
    });

    // Peer quitte
    socket.on('peer-left', (peerId) => {
        if(peers[peerId]){
            peers[peerId].close();
            delete peers[peerId];
            const vid = document.getElementById('video_' + peerId);
            if(vid) vid.remove();
        }
    });

    function createPeerConnection(peerId, socket, isInitiator){
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Ajouter flux local
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        // Recevoir flux distant
        pc.ontrack = (event) => {
            if(document.getElementById('video_' + peerId)) return;
            const video = document.createElement('video');
            video.id = 'video_' + peerId;
            video.autoplay = true;
            video.srcObject = event.streams[0];
            videosDiv.appendChild(video);
        };

        // ICE candidates
        pc.onicecandidate = (event) => {
            if(event.candidate){
                socket.emit('signal', { target: peerId, signal: pc.localDescription });
            }
        };

        peers[peerId] = pc;

        if(isInitiator){
            pc.createOffer().then(offer => pc.setLocalDescription(offer))
              .then(() => socket.emit('signal', { target: peerId, signal: pc.localDescription }));
        }
    }
})();
