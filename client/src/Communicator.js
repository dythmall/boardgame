import socketIOClient from "socket.io-client";

export default class Communicator {
    constructor(id, eventListener, host) {
        this.id = id;
        this.eventListener = eventListener;
        this.socket = socketIOClient(`${host}`);
        this.socket.on('connect', () => {
            console.log('connected');
            this.socket.emit('myping', { id });
        });

        this.socket.on('disconnect', () => this.eventListener('disconnected'));

        this.socket.on('game', (data) => this.eventListener('game', data));

        this.socket.on('end', () => {
            console.log('game is ending');
            this.socket.disconnect();
            this.eventListener('end');
        });

    }

    disconnect() {
        this.socket.disconnect();
    }
    
    start() {
        this.socket.emit('start');
    }

    end() {
        this.socket.emit('end');
    }

    reset() {
        this.socket.emit('reset');
    }

    send(data) {
        Object.assign(data || {}, { gameId: this.id });
        this.socket.emit('game', data);
    }
}
