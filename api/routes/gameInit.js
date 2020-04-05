
const createCards = () => {
    const result = [];
    for (let i = 0; i < 150; i++) {
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

const takeCards = (num, cards) => cards.splice(0, 5)

const initialize = (users, currentUsers) => {
    const gameVariables = new Map();
    gameVariables.shuffledCards = shuffleCards(createCards());
    assignCards(users, gameVariables.shuffledCards);
    gameVariables.order = createOrder(currentUsers);
    gameVariables.storyTeller = currentUsers[gameVariables.order[0]];
    return gameVariables;
}

const createOrder = (users) => Object.keys(users);

module.exports = {
    initialize
}