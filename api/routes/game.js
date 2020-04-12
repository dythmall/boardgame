const { v4 } = require('uuid');
const Dixit = require('../game/Dixit');

let socket;
let loggedIn = {};
const games = new Map();

const setSocket = (sock) => {
    socket = sock;
    sock.on('connection', (s) => {
        console.log('new connection');

        s.on('login', (data) => {
            console.log('login: ' + data.id);
            s.userId = data.id;
        });

        s.on('join', (() => {
            const currentSocket = s;
            return (data) => {
                console.log(data);
                console.log(loggedIn);
                const name = loggedIn[data.id];
                if (!name) {
                    currentSocket.emit('end');
                    currentSocket.disconnect();
                    return;
                }
                if (!games.has(data.gameId)) {
                    currentSocket.disconnect();
                    return;
                }
                const game = games.get(data.gameId);
                game.addUser(name, data.id, currentSocket);
                socket.sockets.emit('gamelist', getGames());
            };
        })());

        s.on('disconnect', () => {
            console.log('disconnected: ' + s.userId);
            const game = games.get(s.gameId);
            if (!game) {
                delete loggedIn[s.userId];
            } else if (game && game.getGameState() === 'waiting') {
                delete loggedIn[s.userId];
                game.disconnected(s.userId);
            }
        });

        s.on('start', (data) => {
            const game = games.get(data.gameId);
            if (game) {
                game.start();
            } else {
                s.disconnect();
            }
        });

        s.on('end', (data) => {
            const game = games.get(data.gameId);
            if (game) {
                game.end();
                games.delete(data.gameId);
            } else {
                s.disconnect();
            }
            socket.sockets.emit('gamelist', getGames());
        });

        s.on('reset', (data) => {
            const game = games.get(data.gameId);
            if (game) {
                game.reset();
            } else {
                s.disconnect();
            }
        });

        s.on('game', (data) => {
            console.log('game');
            console.log(data);
            const game = games.get(data.gameId);
            if (game) {
                game.process(data);
            } else {
                s.disconnect();
            }
        });
    });
};

const setName = (name, id) => {
    if (loggedIn[id]) {
        return id;
    }
    const newId = v4();
    loggedIn[newId] = name;
    console.log(loggedIn);
    return newId;
}

const getGames = () => {
    const gamesList = [];
    games.forEach((game) => {
        const gameInfo = {
            id: game.getId(),
            name: game.getName(),
            users: game.getUserList(),
            state: game.getGameState()
        };
        gamesList.push(gameInfo);
    });
    return gamesList;
}

const create = (name) => {
    const id = v4();
    const game = new Dixit(name, id);
    games.set(id, game);
    return id;
}

module.exports = {
    setSocket,
    setName,
    getGames,
    create
};
