const {v4} = require('uuid');

let socket;
const currentUsers = {};
const users = new Map();
const gameState = 'waiting';

const setSocket = (sock) => {
    socket = sock;
    sock.on('connection', (s) => {
        console.log('new connection')
        s.on('myping', (() => {
            const currentSocket = s;
            return (data) => {
                console.log(data);
                if (!users.has(data.id)) {
                    currentSocket.disconnect();
                } else {
                    users.get(data.id).socket = currentSocket;
                    currentSocket.gameId = data.id;
                    users.forEach((value) => value.socket.emit('user.joined', currentUsers));
                }
            };
        })());

        s.on('disconnect', () => {
            console.log('disconnected');
            console.log(s.gameId);
            if (gameState === 'waiting') {
                const user = users.get(s.gameId);
                users.delete(s.gameId);
                if (user && user.name) {
                    currentUsers[user.name] = null;
                }
            }
        });
    });
};

const isUniqueName = (name) => !currentUsers[name];

const setName = (name) => {
    if (gameState !== 'waiting') {
        return 'gameInPlace';
    }
    if (!isUniqueName(name)) {
        return 'existing';
    }
    const id = v4();
    currentUsers[name] = id;
    users.set(id, {
        name,
        socket: null
    });
    return currentUsers[name];
}

module.exports = {
    setSocket,
    setName
};