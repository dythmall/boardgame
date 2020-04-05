import socketIOClient from "socket.io-client";

export default class Communicator {
    constructor(id, eventListener) {
        this.id = id;
        this.eventListener = eventListener;
        this.socket = socketIOClient('localhost:9000');
        this.socket.on('connect', () => {
            console.log('connected');
            this.socket.emit('myping', {id});
        });

        this.socket.on('disconnect', () => this.eventListener('disconnected'));

        this.socket.on('game', (data) => this.eventListener('game', data));
    }

    start() {
        this.socket.emit('start');
    }
}