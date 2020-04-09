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
        this.onEnd = this.onEnd.bind(this);
        this.onReset = this.onReset.bind(this);
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
        this.setState({ selectedCard: card });
        console.log(card);
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.selectedCard) {
            this.communicator.send({ selectedCard: this.state.selectedCard });
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
        const currentUsers = this.state.currentUsers;
        return (this.state.gameState === 'tally') ? votes.map(vote => <font color={currentUsers[vote.name].color}>{vote.name} </font>) : '';
    }

    onEnd(e) {
        e.preventDefault();
        this.communicator.end();
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

    getOrderText() {
        const order = this.state.order;
        const scores = this.state.scores;
        const currentUsers = this.state.currentUsers;
        const nameWithScores = order.map(name => <font color={currentUsers[name].color}>{name}  ({scores[name]})  </font>);
        return nameWithScores;
    }

    onReset() {
        this.communicator.reset();
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
        const hideTop = isStoryTellerTurn || (isStoryTeller ? false : (isNonStoryTellerTurn && !this.played()));
        return (
            <div className="split">
                <div className="info">
                    <button className="endButton" onClick={this.onEnd}>{this.strings.getText('end')}</button>
                    {this.state.isKing ? <button className="resetButton" onClick={this.onReset}>{this.strings.getText('reset')}</button> : ''}
                </div>
                <div className="info">{this.strings.getText('order')}{this.getOrderText()}</div>
                {this.renderInformation()}
                <div>{isTallying ? <button onClick={this.onTally}>{this.strings.getText('next')}</button> : ''}</div>
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
            return process.env.PUBLIC_URL + '/back.png';
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
                            <img onClick={(e) => {
                                e.preventDefault();
                                this.onSelectMyHand(card);
                            }} className={this.state.selectedCard === card ? 'active' : ''} src={this.getCardUrl(card)} alt=''></img>
                            <div>
                                {' ' + this.getVotes(card)}
                            </div>
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
                        <img className="nonactive" src={this.getCardUrl(card)} alt='' />
                        <div>{this.getVotes(card)}</div>
                    </li>
                ))}
            </ul>
        )
    }

    renderWaiting() {
        return (
            <div className="App">
                <header className="App-header">
                    {(this.state.isKing) ? <button onClick={this.onGameStart}>{this.strings.getText('start')}</button> : ''}
                    <h1>{this.strings.getText('waiting')}</h1>
                    <div>{this.renderUsers()}</div>
                </header>
            </div>
        );
    }

    renderUsers() {
        const currentUsers = this.state.currentUsers;
        return Object.keys(currentUsers).map(userName => {
            return <font color={currentUsers[userName].color}>{userName}  </font>;
        });
    }
}
