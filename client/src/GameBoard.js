import React from 'react';
import './App.css';
import Communicator from './Communicator';

export default class GameBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            currentUsers: {},
            gameState: 'waiting'
        };
        this.onDisConnect = props.onDisConnect;
        this.eventListener = this.eventListener.bind(this);
        this.onGameStart = this.onGameStart.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSelectMyHand = this.onSelectMyHand.bind(this);
        this.onTally = this.onTally.bind(this);
    }

    componentDidMount() {
        this.communicator = new Communicator(this.state.id, this.eventListener, window.location.hostname);
    }

    eventListener(message, value) {
        if (message === 'game') {
            if (value.gameState !== 'waiting') {
                localStorage.setItem('id', this.state.id);
                localStorage.setItem('time', new Date().getTime());
            }
            console.log(value);
            this.setState(value);
        } else if (message === 'end') {
            localStorage.clear();
            this.onDisConnect();
        } else if (message === 'disconnected') {
            this.onDisConnect();
        }
    }

    onGameStart(e) {
        e.preventDefault();
        this.communicator.start();
    }

    render() {
        return (this.state.gameState === 'waiting') ? this.renderWaiting() : this.renderBoard();
    }

    onSelectMyHand(card) {
        this.setState({selectedCard: card});
        console.log(card);
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.selectedCard) {
            this.communicator.send({selectedCard: this.state.selectedCard});
        }
    }

    onTally(e) {
        e.preventDefault();
        this.communicator.send();
    }

    getVotes(card) {
        if (!this.state.votes) {
            return []
        }
        const votes = this.state.votes[card] || [];
        return votes.map(vote => vote.name);
    }

    didVote() {
        return (this.state.voted.indexOf(this.state.id) !== -1);
    }

    played() {
        return (this.state.played.indexOf(this.state.id) !== -1);
    }

    renderInformation() {
        let message = '';
        if (this.state.gameState === 'storyTeller') {
            if (this.state.storyTeller === this.state.id) {
                message = '카드를 고르고 카드에 대한 설명을 해주세요~~';
            } else {
                message = 'Story teller가 고민중 입니다.'
            }
        } else if (this.state.gameState === 'participants') {
            if (this.state.storyTeller === this.state.id) {
                message = '다들 카드를 고르고 있습니다.';
            } else {
                message = 'Story teller의 설명과 비슷한 카드를 골라 주세요~~'
            } 
        } else if (this.state.gameState === 'voting') {
            if (this.state.storyTeller === this.state.id) {
                message = '투표중 입니다.';
            } else if (this.didVote()) {
                message = '투표를 하셨습니다.'
            } else {
                message = '어떤 카드가 Story teller 카드인지 골라 주세요~~'
            }
        } else if (this.state.gameState === 'tally') {
            if (this.state.storyTeller === this.state.id) {
                message = '내 카드가 어떤 카드인지 알려 주세요~~';
            } else {
                message = '당신의 선택이 맞았을까요???'
            }
        }
        return (
            <div className="message">{message}</div>
        )
    }
    renderBoard() {
        const isStoryTeller = this.state.storyTeller === this.state.id;
        const isNonStoryTellerTurn = this.state.gameState === 'participants';
        const isStoryTellerTurn = this.state.gameState === 'storyTeller';
        const isActionable = isStoryTeller ? isStoryTellerTurn : (isNonStoryTellerTurn && !this.played());
	console.log('played: ' + this.played());
        console.log('isActionable: ' + isActionable);
	const isVoting = this.state.gameState === 'voting' && !isStoryTeller && !this.didVote();
        const isTallying = this.state.gameState === 'tally' && isStoryTeller;
        const hideTop = isStoryTellerTurn || (isStoryTeller ? false : isNonStoryTellerTurn);
        return (
            <div className="split">
                <div className="info" onClick={() => this.communicator.end()}>종료하기</div>
                <div className="info">순서: {this.state.order.join(' - ')}</div>
                {this.renderInformation()}
                <div>{isTallying ? <a href="#" onClick={this.onTally}>Next Round</a> : ''}</div>
                <div className={hideTop ? "topPane hidden" : "topPane"}>
                    <h1>Gameboard</h1>
                    {isVoting ? this.rederYourHands(this.state.cardsInTheMiddle) : this.renderNonActionableHand(this.state.cardsInTheMiddle)}
                </div>
                <div className={!hideTop ? "bottomPane hidden" : "bottomPane"}>
                    <h1>내 카드</h1>
                    {isActionable ? this.rederYourHands(this.state.cards) : this.renderNonActionableHand(this.state.cards)}
                </div>
            </div>

        );
    }

    getCardUrl(card) {
        if (card < 0) {
            return process.env.PUBLIC_URL + '/logo192.png';
	}
	return process.env.PUBLIC_URL + `/${card}.png`; 
    }

    rederYourHands(cards) {
        return (
            <div>
                <ul>
                {cards.map(card => (
                    <li className={this.state.selectedCard === card ? 'active' : ''} key={card}>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            this.onSelectMyHand(card);
                        }}>
                            <img src={this.getCardUrl(card)}></img>
                        </a>
                        {' ' + this.getVotes(card)}
                    </li>
                ))}
                </ul>
                <div><a href="#" onClick={this.onSubmit}>Submit</a></div>
            </div>
        )
    }

    renderNonActionableHand(cards) {
        return (
            <ul>
            {cards.map(card => (
                <li key={card}>
                        <img src={this.getCardUrl(card)}></img>
                        {card}
                        {this.getVotes(card)}
                </li>
            ))}
          </ul>
        )
    }

    renderWaiting() {
        return (
            <div className="App">

                <header className="App-header">
                    <a href="#" onClick={this.onGameStart}>{(this.state.isKing) ? 'Start' : ''}</a>
                    <h1>Waiting for people to join...</h1>
                    <div>{Object.keys(this.state.currentUsers).join(', ')}</div>
                </header>
            </div>
        );
    }
}
