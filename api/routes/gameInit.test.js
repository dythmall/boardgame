const {expect} = require('chai');
const gameinit = require('./gameInit');

describe('initialize', () => {
    it('should shuffle cards', () => {
        const users = new Map();
        users.set('a', {});
        const gameVariables = gameinit.initialize(users);

        expect(gameVariables.shuffledCards.length).to.equal(145);
    });

    it('should assign cards', () => {
        const users = new Map();
        users.set('a', {});
        const gameVariables = gameinit.initialize(users);

        expect(users.get('a').cards.length).to.equal(5);
        expect(users.get('a').cards).to.not.deep.equal([1, 2, 3, 4, 5]);
    });
});