const strings = {
    'ko': {
        name: '너의 이름은',
        password: '우리만의 비밀',
        storyTeller: '카드를 고르고 카드에 대한 설명을 해주세요~~',
        nonStoryTeller: 'Story teller가 고민중 입니다.',
        waitParticipants: '다들 카드를 고르고 있습니다.',
        participants: 'Story teller의 설명과 비슷한 카드를 골라 주세요~~',
        voting: '투표중 입니다.',
        vote: '어떤 카드가 Story teller 카드인지 골라 주세요~~',
        voted: '투표를 하셨습니다.',
        tell: '내 카드가 어떤 카드인지 알려 주세요~~',
        isItCorrect: '당신의 선택이 맞았을까요???',
        submit: '카드내기',
        voteSubmit: '투표하기',
        end: '종료하기',
        order: '순서: ',
        myHand: '내 카드',
        reset: '새로운 게임',
        start: '시작하자~~',
        waiting: '다른 사람들을 기다리고 있습니다...'

    },
    'en': {
        name: 'Name',
        password: 'Password',
        storyTeller: 'Pick a card and explain it.',
        nonStoryTeller: 'Story teller is picking a card.',
        waitParticipants: 'Wait till everyone picks a card.',
        participants: 'Pick a card that fits the story.',
        voting: 'Voting...',
        vote: 'Vote for a card that you think is story teller\'s',
        voted: 'Done!',
        tell: 'Tell everyone what your card is.',
        isItCorrect: 'Have you guessed correctly?',
        submit: 'Submit',
        voteSubmit: 'Vote',
        end: 'End',
        order: 'Order: ',
        myHand: 'My hands',
        reset: 'New game',
        start: 'Start',
        waiting: 'Waiting for others to join...',
    }
}

export default class Strings {
    constructor(language) {
        this.language = language;
    }

    getText = (what) => {
        return strings[this.language][what] || 'UNKNOWN';
    }
}
