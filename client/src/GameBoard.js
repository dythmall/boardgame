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

    renderBoard() {
        const isStoryTeller = this.state.storyTeller === this.state.id;
        const isNonStoryTellerTurn = this.state.gameState === 'participants';
        const isActionable = isStoryTeller ? !isNonStoryTellerTurn : isNonStoryTellerTurn;
        return (
            <div className="split">
                <div className="topPane">
                    <h1 onClick={() => this.communicator.end()}>End</h1>
                    <div>{this.state.order.join(' - ')}</div>
                    <div>{isStoryTeller ? 'You are story teller' : ''}</div>
                    <h1>Cards will show here</h1>
                </div>
                <div className="bottomPane">
                    <h1>Your hands</h1>
                    {isActionable ? this.rederYourHands() : this.renderNonActionableHand()}
                </div>
            </div>

        );
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

    rederYourHands() {
        const cards = this.state.cards;
        return (
            <div>
                <ul>
                {cards.map(card => (
                    <li className={this.state.selectedCard === card ? 'active' : ''} key={card}>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            this.onSelectMyHand(card);
                        }}>
                            <img src={process.env.PUBLIC_URL + '/logo192.png'}></img>
                            {card}
                        </a>
                    </li>
                ))}
                </ul>
                <div><a href="#" onClick={this.onSubmit}>Submit</a></div>
            </div>
        )
    }

    renderNonActionableHand() {
        const cards = this.state.cards;
        return (
            <ul>
            {cards.map(card => (
                <li key={card}>
                        <img src={process.env.PUBLIC_URL + '/logo192.png'}></img>
                        {card}
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