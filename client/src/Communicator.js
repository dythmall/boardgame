import socketIOClient from "socket.io-client";

export default class Communicator {
    constructor(eventListener, host) {
        this.ids = {};
        this.eventListener = eventListener;
        this.socket = socketIOClient(`${host}`);
        this.socket.on('connect', () => {
            console.log('connected');
        });

        this.socket.on('disconnect', () => this.eventListener('disconnected'));

        this.socket.on('game', (data) => this.eventListener('game', data));

        this.socket.on('gamelist', (games) => this.eventListener('gamelist', games));
        this.socket.on('end', () => {
            console.log('game is ending');
            this.eventListener('end');
        });
    }

    setEventListener(eventListener) {
        this.eventListener = eventListener;
    }

    setIds(ids) {
        this.ids = ids;
    }

    join() {
        this.socket.emit('join', this.ids);
    }

    disconnect() {
        this.socket.disconnect();
    }
    
    start() {
        this.socket.emit('start', this.ids);
    }

    end() {
        this.socket.emit('end', this.ids);
    }

    reset() {
        this.socket.emit('reset', this.ids);
    }

    login(id) {
        this.socket.emit('login', {id});
    }

    send(data) {
        console.log(data);
        console.log(this.ids);
        data = Object.assign((data || {}), this.ids);
        this.socket.emit('game', data);
    }
}
