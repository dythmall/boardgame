const beforeStart = 'waiting';
const states = ['storyTeller', 'participants', 'voting', 'tally'];

const start = () => {
    return states[0];
}

const init = () => {
    return beforeStart;
}

const end = () => {
    return beforeStart;
}

const nextState = (currentState) => {
    const index = states.findIndex(currentState);
    const nextIndex = (index === states.length - 1) ? 0 : index + 1;
    return states[nextIndex];
}

module.exports = {
    start, init, end, nextState
}
