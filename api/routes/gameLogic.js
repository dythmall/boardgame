
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
    gameVariables.set('gameState', 'storyTeller');
    return gameVariables;
}

const assignSelectedCards = (gameVariables, data) => {
    const cards = gameVariables.get('participantCards');
    const selectedCard = +data.selectedCard;
    cards[selectedCard] = { id: data.gameId, votes: [] };
}

const removeAndTakeCard = (users, data, shuffledCards) => {
    const user = users.get(data.gameId);
    user.cards = user.cards.filter(card => card !== +data.selectedCard);
    user.cards.push(...takeCards(1, shuffledCards));
}

const storyTellerTurn = (users, gameVariables, data) => {
    const selectedCard = +data.selectedCard;
    assignSelectedCards(gameVariables, data);
    gameVariables.set('storyTellerCard', selectedCard);
    removeAndTakeCard(users, data, gameVariables.get('shuffledCards'));
    gameVariables.get('cardsInTheMiddle').push(-1);
    gameVariables.set('gameState', 'participants');
}

const participants = (users, gameVariables, data) => {
    assignSelectedCards(gameVariables, data);
    removeAndTakeCard(users, data, gameVariables.get('shuffledCards'));
    const middleCards = gameVariables.get('cardsInTheMiddle');
    middleCards.push(-1);
    if (middleCards.length === users.size) {
        gameVariables.set('gameState', 'voting');
        const participantCards = Object.keys(gameVariables.get('participantCards')).map(card => +card);
        gameVariables.set('cardsInTheMiddle', shuffleCards(participantCards));
    }
}

const voting = (users, gameVariables, data) => {
    const cards = gameVariables.get('participantCards');
    const selectedCard = +data.selectedCard;
    const id = data.gameId;
    cards[selectedCard].votes.push({
        id,
        name: users.get(id).name
    });
    const votes = Object.keys(cards).reduce((map, card) => {
        map[card] = cards[card].votes;
        return map;
    }, {});
    gameVariables.set('votes', votes);
    const voted = gameVariables.get('voted');
    voted.push(id);
    if (voted.length === users.size - 1) {
        gameVariables.set('gameState', 'tally');
    }
}

const tally = (gameVariables, currentUsers) => {
    gameVariables.set('votes', {});
    gameVariables.set('voted', []);
    const order = gameVariables.get('order');
    const currentStoryTeller = order.splice(0, 1);
    order.push(...currentStoryTeller);
    gameVariables.set('storyTeller', currentUsers[gameVariables.get('order')[0]]);
    gameVariables.set('storyTellerCard', null);
    gameVariables.set('participantCards', {});
    gameVariables.set('cardsInTheMiddle', []);
    gameVariables.set('gameState', 'storyTeller');
}

const calculateScores = (votes, storyTellerCard, numPlayers) => {
    const numVotedForStoryTeller = votes[storyTellerCard].length;
    if (numVotedForStoryTeller === 0 || numVotedForStoryTeller === numPlayers - 1) {

    }
}

const createOrder = (users) => Object.keys(users);

module.exports = {
    initialize,
    storyTellerTurn,
    participants,
    voting,
    tally,
}
