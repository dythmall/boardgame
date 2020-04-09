const { v4 } = require('uuid');
const gameLogic = require('./gameLogic');

let socket;
let currentUsers = {};
const users = new Map();
let gameState = 'waiting';
let gameVariables = new Map();
let loggedIn = {};
const sendGameInfo = () => {
    users.forEach((value) => {
        if (value.socket == null) {
            return;
        }
        value.socket.emit('game', {
            currentUsers,
            gameState,
            cards: value.cards,
            isKing: value.isKing,
            order: gameVariables.get('order'),
            storyTeller: gameVariables.get('storyTeller'),
            cardsInTheMiddle: gameVariables.get('cardsInTheMiddle'),
            votes: gameVariables.get('votes'),
            voted: gameVariables.get('voted'),
            played: gameVariables.get('played'),
            scores: gameVariables.get('scores'),
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
                console.log(loggedIn);
                const name = loggedIn[data.id];
                if (!name) {
                    currentSocket.disconnect();
                    return;
                }
                const existingUser = users.get(data.id);
                if (existingUser) {
                    existingUser.socket = currentSocket;
                } else {
                    let isKing = false;
                    if (users.size === 0) {
                        isKing = true;
                    }
                    currentUsers[name] = {
                        id: data.id,
                        color: createColor()
                    };
                    users.set(data.id, {
                        name,
                        socket: currentSocket,
                        isKing,
                        score: 0,
                        id: data.id
                    });
                }
                currentSocket.gameId = data.id;
                sendGameInfo();
            };
        })());

        s.on('disconnect', () => {
            console.log('disconnected: ' + s.gameId);
            if (gameState === 'waiting') {
                const user = users.get(s.gameId);
                users.delete(s.gameId);
                delete loggedIn[s.gameId];
                if (user && user.name) {
                    delete currentUsers[user.name];
                }
                if (user && user.isKing) {
                    const userIter = users.entries().next();
                    if (!userIter.done) {
                        const [index, nextUser] = userIter.value;
                        nextUser['isKing'] = true;
                    }
                }
                sendGameInfo();
            }
        });

        s.on('start', () => {
            gameState = 'storyTeller';
            gameVariables = gameLogic.initialize(users, currentUsers);
            gameVariables.set('gameState', gameState);
            sendGameInfo();
        });

        s.on('end', () => {
            gameState = 'waiting';
            users.forEach(user => {
                user.socket.emit('end');
            });
            users.clear();
            currentUsers = {};
            gameVariables.clear();
        });

        s.on('reset', () => {
            gameVariables = gameLogic.initialize(users, currentUsers);
            gameState = gameVariables.get('gameState');
            sendGameInfo();
        });

        s.on('game', (data) => {
            console.log(`${gameState}: ${JSON.stringify(data)}`);
            if (gameState === 'storyTeller') {
                gameLogic.storyTellerTurn(users, gameVariables, data);
                gameState = gameVariables.get('gameState');
                sendGameInfo();
            } else if (gameState === 'participants') {
                gameLogic.participants(users, gameVariables, data);
                gameState = gameVariables.get('gameState');
                sendGameInfo();
            } else if (gameState === 'voting') {
                gameLogic.voting(users, gameVariables, data);
                gameState = gameVariables.get('gameState');
                sendGameInfo();
            } else if (gameState === 'tally') {
                gameLogic.tally(gameVariables, currentUsers, users);
                gameState = gameVariables.get('gameState');
                sendGameInfo();
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
    loggedIn[id] = name;
    return id;
}

const createColor = () => {
    var hex = '#';
    var range = 'ABCDEF0123456789';

    for (var i = 0; i < 6; i++) {
        hex += range.charAt(Math.floor(Math.random() * range.length));
    }
    return hex;
}

module.exports = {
    setSocket,
    setName
};
