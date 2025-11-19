class Signaling {
    constructor(tech, channel) {
        this.tech = tech;         // 'socketio', 'websocket', 'xhr'
        this.channel = channel;
        this.listeners = {};
        this.init();
    }

    init() {
        if (this.tech === 'socketio') {
            this.socket = io.connect('http://localhost:8181');
            this.socket.emit('create or join', this.channel);

            this.socket.on('message', msg => this.emit('message', msg));
            this.socket.on('response', msg => this.emit('response', msg));
            this.socket.on('Bye', () => this.emit('Bye'));
        }
        else if (this.tech === 'websocket') {
            this.ws = new WebSocket(`ws://localhost:8080`);
            this.ws.onopen = () => console.log("WebSocket connected");
            this.ws.onmessage = event => this.emit('message', event.data);
        }
        else if (this.tech === 'xhr') {
            console.log("XHR signaling: messages seront pollés périodiquement");
            // Exemple simple: on pourrait faire du long-polling ici
        }
    }

    on(event, callback) {
        this.listeners[event] = callback;
    }

    emit(event, data) {
        if (this.listeners[event]) this.listeners[event](data);
    }

    send(msg) {
        if (this.tech === 'socketio') this.socket.emit('message', { channel: this.channel, message: msg });
        else if (this.tech === 'websocket' && this.ws.readyState === WebSocket.OPEN) this.ws.send(msg);
        else if (this.tech === 'xhr') {
            // Ici, on ferait un POST via fetch/XHR
            fetch(`/send?channel=${this.channel}&message=${encodeURIComponent(msg)}`);
        }
    }
}
