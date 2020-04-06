const {expect} = require('chai');
const gameinit = require('./gameLogic');

describe('initialize', () => {
    it('should shuffle cards', () => {
        const users = new Map();
        users.set('a', {});
        const currentUsers = {
            a: 'id'
        };
        const gameVariables = gameinit.initialize(users, currentUsers);

        expect(gameVariables.get('shuffledCards').length).to.equal(144);
    });

    it('should assign cards', () => {
        const users = new Map();
        users.set('a', {});
        const currentUsers = {
            a: 'id'
        };
        const gameVariables = gameinit.initialize(users, currentUsers);

        expect(users.get('a').cards.length).to.equal(5);
        expect(users.get('a').cards).to.not.deep.equal([1, 2, 3, 4, 5]);
    });
});

describe('storyTellerTurn', () => {
    it('should add card to participants', () => {
        const users = new Map();
        users.set('id', {
            cards: [4, 1, 2, 3]
        });
        const gameVariables = new Map();
        gameVariables.set('participantCards', {});
        gameVariables.set('cardsInTheMiddle', []);
        gameVariables.set('shuffledCards', [10]);

        const data = {selectedCard: '4', gameId: 'id'};

        gameinit.storyTellerTurn(users, gameVariables, data);

        expect(gameVariables.get('participantCards')).to.deep.equal({4: {id: 'id', votes:[]}});
        expect(gameVariables.get('cardsInTheMiddle')).to.deep.equal([-1]);
        expect(gameVariables.get('storyTellerCard')).to.equal(4);

        expect(gameVariables.get('shuffledCards')).to.deep.equal([]);
        expect(users.get('id').cards).to.deep.equal([1, 2, 3, 10]);
        expect(gameVariables.get('gameState')).to.equal('participants');
    });
});

describe('participants', () => {
    it('should add card to participants', () => {
        const users = new Map();
        users.set('id', {
            cards: [4, 1, 2, 3]
        });
        users.set('storyTeller', {
            cards: [5, 6, 7, 8]
        });
        const gameVariables = new Map();
        gameVariables.set('participantCards', {});
        gameVariables.set('cardsInTheMiddle', []);
        gameVariables.set('shuffledCards', [10]);
        gameVariables.set('gameState', 'participants');

        const data = {selectedCard: '4', gameId: 'id'};

        gameinit.participants(users, gameVariables, data);

        expect(gameVariables.get('participantCards')).to.deep.equal({4: {id: 'id', votes:[]}});
        expect(gameVariables.get('cardsInTheMiddle')).to.deep.equal([-1]);

        expect(gameVariables.get('shuffledCards')).to.deep.equal([]);
        expect(users.get('id').cards).to.deep.equal([1, 2, 3, 10]);
        expect(gameVariables.get('gameState')).to.equal('participants');
    });

    it('should change state to voting', () => {
        const users = new Map();
        users.set('id', {
            cards: [4, 1, 2, 3]
        });
        users.set('storyTeller', {
            cards: [5, 6, 7, 8]
        });
        const gameVariables = new Map();
        gameVariables.set('participantCards', {10: {id: 'storyTeller', votes:[]}});
        gameVariables.set('cardsInTheMiddle', [-1]);
        gameVariables.set('shuffledCards', [10, 100]);
        gameVariables.set('gameState', 'participants');

        const data = {selectedCard: '4', gameId: 'id'};

        gameinit.participants(users, gameVariables, data);

        expect(gameVariables.get('participantCards')).to.deep.equal({4: {id: 'id', votes:[]}, 10: {id: 'storyTeller', votes:[]}});
        expect(gameVariables.get('cardsInTheMiddle')).to.contain(10);
        expect(gameVariables.get('cardsInTheMiddle')).to.contain(4);

        expect(gameVariables.get('shuffledCards')).to.deep.equal([100]);
        expect(users.get('id').cards).to.deep.equal([1, 2, 3, 10]);
        expect(gameVariables.get('gameState')).to.equal('voting');
    });
});

describe('voting', () => {
    it('should add to votes and voted', () => {
        const users = new Map();
        users.set('id', {
            cards: [4, 1, 2, 3],
            name: 'user'
        });
        users.set('storyTeller', {
            cards: [5, 6, 7, 8],
            name: 'tellerUser'
        });
        const gameVariables = new Map();
        gameVariables.set('participantCards', {10: {id: 'storyTeller', votes:[]}, 11: {id: 'id', votes:[]}});
        gameVariables.set('cardsInTheMiddle', [10, 11]);
        gameVariables.set('gameState', 'voting');
        gameVariables.set('votes', {});
        gameVariables.set('voted', []);

        const data = {selectedCard: '10', gameId: 'id'};

        gameinit.voting(users, gameVariables, data);

        expect(gameVariables.get('votes')).to.deep.equal({
              "10": [
                {
                  "id": "id",
                  "name": "user"
                }
              ],
              "11": []
            });
        expect(gameVariables.get('voted')).to.deep.equal(['id']);

        expect(gameVariables.get('gameState')).to.equal('tally');
    });
});
