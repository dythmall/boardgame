const {v4} = require('uuid');
const gameInit = require('./gameInit');

let socket;
const currentUsers = {};
const users = new Map();
let gameState = 'waiting';
let gameVariables = {};

const createCards = () => {
    const result = [];
    for (let i = 0; i < 150; i++) {
        result.push(i);
    }
    return result;
};

const sendGameInfo = () => {
    users.forEach((value) => {
        value.socket.emit('game', {
            currentUsers,
            gameState,
            cards: value.cards,
            isKing: value.isKing,
            order: gameVariables.order,
            storyTeller: gameVariables.storyTeller
        });
    });
}

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
                    sendGameInfo();
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
                    delete currentUsers[user.name];
                }
                if (user && user.isKing) {
                    // nominate a king
                }
                sendGameInfo();
            }
        });

        s.on('start', () => {
            gameState = 'storyTeller';
            prepareGame();
        })
    });
};

const prepareGame = () => {
    gameVariables = gameInit.initialize(users, currentUsers);
    sendGameInfo();
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
    let isKing = false;
    if (users.size === 0) {
        isKing = true;
    }
    currentUsers[name] = id;
    users.set(id, {
        name,
        socket: null,
        isKing
    });
    return currentUsers[name];
}

module.exports = {
    setSocket,
    setName
};