import socketIOClient from "socket.io-client";

export default class Communicator {
    constructor(id, eventListener) {
        this.id = id;
        this.eventListener = eventListener;
        this.socket = socketIOClient('ec2-34-222-109-163.us-west-2.compute.amazonaws.com:9000');
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