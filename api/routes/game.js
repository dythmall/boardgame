const {v4} = require('uuid');
const gameLogic = require('./gameLogic');

let socket;
let currentUsers = {};
const users = new Map();
let gameState = 'waiting';
let gameVariables = new Map();

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
            console.log('disconnected: ' + s.gameId);
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
    let isKing = false;
    if (users.size === 0) {
        isKing = true;
    }
    currentUsers[name] = {
        id,
        color: createColor()
    };
    users.set(id, {
        name,
        socket: null,
        isKing,
        score: 0,
        id: id
    });
    return currentUsers[name].id;
}

const createColor = () => {
    var hex = '#';
    var range = 'ABCDEF0123456789';

    for (var i = 0; i < 6; i++ ) {
      hex += range.charAt(Math.floor(Math.random() * range.length));
    }
    return hex;
}

module.exports = {
    setSocket,
    setName
};
