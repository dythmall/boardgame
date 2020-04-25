const gameLogic = require('./gameLogic');
const fs = require('fs');

class Dixit {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.users = new Map();
        this.gameVariables = new Map();
        this.gameVariables.set('gameState', 'waiting');
        this.currentUsers = {};
    }

    getUserList() {
        return Object.keys(this.currentUsers);
    }

    getGameState() {
        return this.gameVariables.get('gameState');
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getUsers() {
        return this.users;
    }

    addUser(name, id, socket) {
        console.log('add user: ' + name + ', id: ' + id);
        const existingUser = this.users.get(id);
        if (existingUser) {
            existingUser.socket = socket;
        } else {
            let isKing = false;
            if (this.users.size === 0) {
                isKing = true;
            }
            this.currentUsers[name] = {
                id,
                color: this.createColor()
            };
            this.users.set(id, {
                name,
                socket: socket,
                isKing,
                score: 0,
                id
            });
        }
        socket.userId = id;
        socket.gameId = this.id;
        this.sendGameInfo();
    }

    createColor() {
        var hex = '#';
        var range = 'ABCDEF0123456789';
    
        for (var i = 0; i < 6; i++) {
            hex += range.charAt(Math.floor(Math.random() * range.length));
        }
        return hex;
    }

    sendGameInfo() {
        this.users.forEach((user) => {
            if (user.socket == null) {
                return;
            }
            user.socket.emit('game', {
                currentUsers: this.currentUsers,
                gameState: this.gameVariables.get('gameState'),
                cards: user.cards,
                isKing: user.isKing,
                order: this.gameVariables.get('order'),
                storyTeller: this.gameVariables.get('storyTeller'),
                cardsInTheMiddle: this.gameVariables.get('cardsInTheMiddle'),
                votes: this.gameVariables.get('votes'),
                voted: this.gameVariables.get('voted'),
                played: this.gameVariables.get('played'),
                scores: this.gameVariables.get('scores'),
                gameId: this.id,
            });
        });
    }

    disconnected(id) {
        console.log('disconnected: ' + id);
        if (this.gameVariables.get('gameState') === 'waiting') {
            const user = this.users.get(id);
            this.users.delete(id);
            if (user && user.name) {
                delete this.currentUsers[user.name];
            }
            if (user && user.isKing) {
                const userIter = this.users.entries().next();
                if (!userIter.done) {
                    const [index, nextUser] = userIter.value;
                    nextUser['isKing'] = true;
                }
            }
            this.sendGameInfo();
        }
    }

    start() {
        const cards = fs.readdirSync('./public/cards');
        this.numCards = cards.length - 1;
        this.gameVariables = gameLogic.initialize(this.users, this.currentUsers, this.numCards);
        this.sendGameInfo();
    }

    end() {
        this.users.forEach(user => {
            user.socket.gameId = null;
            user.socket.emit('end');
        });
        this.users.clear();
        this.currentUsers = {};
        this.gameVariables.clear();
        this.gameVariables.set('gameState', 'waiting');
    }

    reset() {
        this.gameVariables = gameLogic.initialize(this.users, this.currentUsers, this.numCards);
        this.sendGameInfo();
    }

    process(data) {
        const gameState = this.gameVariables.get('gameState');
        console.log(`${gameState}: ${JSON.stringify(data)}`);
        if (gameState === 'storyTeller') {
            gameLogic.storyTellerTurn(this.users, this.gameVariables, data);
            this.sendGameInfo();
        } else if (gameState === 'participants') {
            gameLogic.participants(this.users, this.gameVariables, data);
            this.sendGameInfo();
        } else if (gameState === 'voting') {
            gameLogic.voting(this.users, this.gameVariables, data);
            this.sendGameInfo();
        } else if (gameState === 'tally') {
            gameLogic.tally(this.gameVariables, this.currentUsers, this.users);
            this.sendGameInfo();
        }
    }
}

module.exports = Dixit;