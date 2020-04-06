
const createCards = () => {
    const result = [];
    for (let i = 1; i < 150; i++) {
        result.push(i);
    }
    return result;
};

const shuffleCards = (cards) => {
    for (let i = cards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    
        // swap elements array[i] and array[j]
        // we use "destructuring assignment" syntax to achieve that
        // you'll find more details about that syntax in later chapters
        // same can be written as:
        // let t = array[i]; array[i] = array[j]; array[j] = t
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
};

const assignCards = (users, cards) => {
    users.forEach(user => {
        user.cards = takeCards(5, cards);
    })
};

const takeCards = (num, cards) => cards.splice(0, num)

const initialize = (users, currentUsers) => {
    const gameVariables = new Map();
    gameVariables.set('shuffledCards', shuffleCards(createCards()));
    assignCards(users, gameVariables.get('shuffledCards'));
    gameVariables.set('order', createOrder(currentUsers));
    gameVariables.set('storyTeller', currentUsers[gameVariables.get('order')[0]]);
    gameVariables.set('storyTellerCard', null);
    gameVariables.set('participantCards', {});
    gameVariables.set('cardsInTheMiddle', []);
    gameVariables.set('votes', {});
    gameVariables.set('voted', []);
    return gameVariables;
}

const createOrder = (users) => Object.keys(users);

module.exports = {
    initialize,
    takeCards,
    shuffleCards
}