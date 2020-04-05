import socketIOClient from "socket.io-client";

export default class Communicator {
    constructor(id, eventListener, host) {
        this.id = id;
        this.eventListener = eventListener;
        this.socket = socketIOClient(`${host}:9000`);
        this.socket.on('connect', () => {
            console.log('connected');
            this.socket.emit('myping', {id});
        });

        this.socket.on('disconnect', () => this.eventListener('disconnected'));

        this.socket.on('game', (data) => this.eventListener('game', data));

        this.socket.on('end', () => {
            console.log('game is ending');
            this.socket.disconnect();
            this.eventListener('end');
        });

    }

    start() {
        this.socket.emit('start');
    }

    end() {
        this.socket.emit('end');
    }

    send(data) {
        this.socket.emit('game', data);
    }
}