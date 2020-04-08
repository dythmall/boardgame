import React from 'react';
import './App.css';
import Communicator from './Communicator';
import Strings from './Strings';

export default class GameBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            currentUsers: {},
            gameState: 'waiting',
        };
        this.onDisConnect = props.onDisConnect;
        this.eventListener = this.eventListener.bind(this);
        this.onGameStart = this.onGameStart.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSelectMyHand = this.onSelectMyHand.bind(this);
        this.onTally = this.onTally.bind(this);
        this.strings = new Strings(props.language);
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
        return votes.map(vote => vote.name).join(', ');
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
                message = this.strings.getText('storyTeller');
            } else {
                message = this.strings.getText('nonStoryTeller');
            }
        } else if (this.state.gameState === 'participants') {
            if (this.state.storyTeller === this.state.id) {
                message = this.strings.getText('waitParticipants');
            } else {
                message = this.strings.getText('participants');
            } 
        } else if (this.state.gameState === 'voting') {
            if (this.state.storyTeller === this.state.id) {
                message = this.strings.getText('voting');;
            } else if (this.didVote()) {
                message = this.strings.getText('voted');
            } else {
                message = this.strings.getText('vote');
            }
        } else if (this.state.gameState === 'tally') {
            if (this.state.storyTeller === this.state.id) {
                message = this.strings.getText('tell');
            } else {
                message = this.strings.getText('isItCorrect');
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
                <div className="info" onClick={() => this.communicator.end()}>{this.strings.getText('end')}</div>
                <div className="info">{this.strings.getText('order')}{this.state.order.join(' - ')}</div>
                {this.renderInformation()}
                <div>{isTallying ? <a href="#" onClick={this.onTally}>Next Round</a> : ''}</div>
                <div className={hideTop ? "topPane hidden" : "topPane"}>
                    <h1>Gameboard</h1>
                    {isVoting ? this.rederYourHands(this.state.cardsInTheMiddle) : this.renderNonActionableHand(this.state.cardsInTheMiddle)}
                </div>
                <div className={!hideTop ? "bottomPane hidden" : "bottomPane"}>
                    <h1>{this.strings.getText('myHand')}</h1>
                    {isActionable ? this.rederYourHands(this.state.cards) : this.renderNonActionableHand(this.state.cards)}
                </div>
            </div>

        );
    }

    getCardUrl(card) {
        if (card < 0) {
            return process.env.PUBLIC_URL + '/logo192.png';
	    }
	    return process.env.PUBLIC_URL + `/${card}.jpeg`; 
    }

    rederYourHands(cards) {
        return (
            <div>
                <div><button className="submitButton" type="button" onClick={this.onSubmit}>{this.strings.getText('submit')}</button></div>
                <ul>
                {cards.map(card => (
                    <li key={card}>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            this.onSelectMyHand(card);
                        }}>
                            <img className={this.state.selectedCard === card ? 'active' : ''} src={this.getCardUrl(card)}></img>
                        </a>
                        {' ' + this.getVotes(card)}
                    </li>
                ))}
                </ul>
            </div>
        )
    }

    renderNonActionableHand(cards) {
        return (
            <ul>
            {cards.map(card => (
                <li key={card}>
                        <img src={this.getCardUrl(card)}></img>
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
