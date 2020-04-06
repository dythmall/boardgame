const {v4} = require('uuid');
const gameInit = require('./gameInit');

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
            if (gameState === 'storyTeller') {
                const cards = gameVariables.get('participantCards');
                cards[data.selectedCard] = { id: s.gameId, votes: [] };

                gameVariables.set('storyTellerCard', data.selectedCard);
                const storyTeller = users.get(s.gameId);
                storyTeller.cards = storyTeller.cards.filter(card => card !== data.selectedCard)
                storyTeller.cards.push(gameInit.takeCards(1, gameVariables.get('shuffledCards')));
                gameState = 'participants';
                gameVariables.get('cardsInTheMiddle').push(-1);
                sendGameInfo();
            } else if (gameState === 'participants') {
                const cards = gameVariables.get('participantCards');
                cards[data.selectedCard] = { id: s.gameId, votes: [] };
                const user = users.get(s.gameId);
                user.cards = user.cards.filter(card => card !== data.selectedCard);
                user.cards.push(gameInit.takeCards(1, gameVariables.get('shuffledCards')));
                const middleCards = gameVariables.get('cardsInTheMiddle');
                middleCards.push(-1);
                if (middleCards.length === users.size) {
                    gameState = 'voting';
                    const participantCards = Object.keys(gameVariables.get('participantCards'));
                    gameVariables.set('cardsInTheMiddle', gameInit.shuffleCards(participantCards));
                }
                sendGameInfo();
            } else if (gameState === 'voting') {
                console.log(data);
                const cards = gameVariables.get('participantCards');
                cards[data.selectedCard].votes.push({
                    id: s.gameId,
                    name: users.get(s.gameId).name
                });
                const votes = Object.keys(cards).reduce((map, card) => {
                    map[card] = cards[card].votes;
                    return map;
                }, {});
                gameVariables.set('votes', votes);
                gameVariables.get('voted').push(s.gameId);
                if (gameVariables.get('voted').length === users.size - 1) {
                    gameState = 'tally';
                }
                sendGameInfo();
            } else if (gameState === 'tally') {
                gameVariables.set('votes', {});
                gameVariables.set('voted', []);
                const order = gameVariables.get('order');
                const currentStoryTeller = order.splice(0, 1);
                order.push(...currentStoryTeller);
                gameVariables.set('storyTeller', currentUsers[gameVariables.get('order')[0]]);
                gameVariables.set('storyTellerCard', null);
                gameVariables.set('participantCards', {});
                gameVariables.set('cardsInTheMiddle', []);
                gameState = 'storyTeller';
                sendGameInfo();
            }
        });
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