import React from 'react';
import './App.css';
import Strings from './Strings';

export default class GameBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            gameId: props.gameId,
            currentUsers: {},
            gameState: 'waiting',
        };
        this.onDisconnect = props.onDisconnect;
        this.eventListener = this.eventListener.bind(this);
        this.onGameStart = this.onGameStart.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSelectMyHand = this.onSelectMyHand.bind(this);
        this.onTally = this.onTally.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onReset = this.onReset.bind(this);
        this.strings = new Strings(props.language);
        this.communicator = props.communicator;
        this.communicator.setIds({id: props.id, gameId: props.gameId});
        this.communicator.setEventListener(this.eventListener);
    }

    componentDidMount() {
        this.communicator.join();
    }

    eventListener(message, value) {
        if (message === 'game') {
            if (value.gameState !== 'waiting') {
                localStorage.setItem('id', this.state.id);
                localStorage.setItem('time', new Date().getTime());
                localStorage.setItem('gameId', this.state.gameId);
            }
            console.log(value);
            this.setState(value);
        } else if (message === 'end') {
            localStorage.clear();
            this.onDisconnect();
        } else if (message === 'disconnected') {
            this.onDisconnect();
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

    renderVotes(card) {
        if (this.state.gameState !== 'tally') {
            return null;
        }
        if (!this.state.votes) {
            return null;
        }
        const votes = this.state.votes[card] || [];
        const currentUsers = this.state.currentUsers;
        return votes.map(vote => <font key={currentUsers[vote.name].id} color={currentUsers[vote.name].color}>{vote.name} </font>);
    }

    renderCardNumbers(number) {
        if (this.state.gameState !== 'tally') {
            return null;
        }
        return <div className="card_number name">{number}</div>
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

    renderStanding() {
        const scores = this.state.scores;
        const list = Object.keys(scores);
        list.sort((a, b) => scores[b] - scores[a])
        const currentUsers = this.state.currentUsers;
        const nameWithScores = list.map(name => <font key={currentUsers[name].id} color={currentUsers[name].color}>{name}  ({scores[name]})  </font>);
        return nameWithScores;
    }

    renderStoryTeller() {
        const storyTeller = this.state.order[0];
        return <font color={this.state.currentUsers[storyTeller].color}>{storyTeller}</font>;
    }

    onReset() {
        this.communicator.reset();
    }

    renderBoard() {
        const isStoryTeller = this.state.storyTeller === this.state.id;
        const isNonStoryTellerTurn = this.state.gameState === 'participants' && !this.played();
        const isStoryTellerTurn = this.state.gameState === 'storyTeller';
        const isActionable = isStoryTeller ? isStoryTellerTurn : isNonStoryTellerTurn;
        const isVoting = this.state.gameState === 'voting' && !isStoryTeller && !this.didVote();
        const isTallying = this.state.gameState === 'tally' && isStoryTeller;
        const hideTop = isStoryTellerTurn || (isStoryTeller ? false : isNonStoryTellerTurn);
        return (
            <div className="split">
                <div className="info">
                    <button className="endButton" onClick={this.onEnd}>{this.strings.getText('end')}</button>
                    {this.state.isKing ? <button className="resetButton" onClick={this.onReset}>{this.strings.getText('reset')}</button> : null}
                </div>
                <div className="info name">{this.strings.getText('storyTellerIs')}{this.renderStoryTeller()}<br />{this.renderStanding()}</div>
                {this.renderInformation()}
                <div>{isTallying ? <button onClick={this.onTally}>{this.strings.getText('next')}</button> : null}</div>
                <div className={hideTop ? "topPane hidden" : "topPane"}>
                    <h1>{this.strings.getText('gameboard')}</h1>
                    {this.rederYourHands(this.state.cardsInTheMiddle, isVoting)}
                </div>
                <div className={!hideTop ? "bottomPane hidden" : "bottomPane"}>
                    <h1>{this.strings.getText('myHand')}</h1>
                    {this.rederYourHands(this.state.cards, isActionable)}
                </div>
            </div>

        );
    }

    getCardUrl(card) {
        if (card < 0) {
            return process.env.PUBLIC_URL + '/cards/0.jpeg';
        }
        return process.env.PUBLIC_URL + `/cards/${card}.jpeg`;
    }

    getButtonText() {
        const isStoryTeller = this.state.storyTeller === this.state.id;
        const isVoting = this.state.gameState === 'voting' && !isStoryTeller && !this.didVote();
        return isVoting ? this.strings.getText('voteSubmit') : this.strings.getText('submit');
    }

    getCardClass(isActionable, card) {
        if (!isActionable) {
            return 'nonactive';
        }
        if (this.state.selectedCard === card) {
            return 'active';
        }
        return '';
    }

    renderSubmitButton(isActionable, card) {
        if (isActionable && this.state.selectedCard === card) {
            return <button className="submitButton" type="button" onClick={this.onSubmit}>{this.getButtonText()}</button>;
        }
        return null;
    }

    rederYourHands(cards, isActionable) {
        let key = 1;
        return (
            <div>
                <ul>
                    {cards.map(card => (
                        <li key={key}>
                            <div className='cardContainer' key={key}>
                                <img key={key} onClick={(e) => {
                                    e.preventDefault();
                                    if (isActionable) {
                                        this.onSelectMyHand(card);
                                    }
                                }} className={this.getCardClass(isActionable, card)} src={this.getCardUrl(card)} alt=''></img>
                                {this.renderSubmitButton(isActionable, card)}
                                <div className='name votes'>{this.renderVotes(card)}</div>
                                {this.renderCardNumbers(key++)}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    renderWaiting() {
        return (
            <div className="App">
                <header className="App-header">
                    {(this.state.isKing) ? <button onClick={this.onGameStart}>{this.strings.getText('start')}</button> : null}
                    <h1>{this.strings.getText('waiting')}</h1>
                    <div className='name'>{this.renderUsers()}</div>
                </header>
            </div>
        );
    }

    renderUsers() {
        const currentUsers = this.state.currentUsers;
        return Object.keys(currentUsers).map(userName => {
            return <font key={currentUsers[userName].id} color={currentUsers[userName].color}>{userName}  </font>;
        });
    }
}
