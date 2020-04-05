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
    }

    componentDidMount() {
        this.communicator = new Communicator(this.state.id, this.eventListener);
    }

    eventListener(message, value) {
        if (message === 'game') {
            if (value.gameState !== 'waiting') {
                localStorage.setItem('id', this.state.id);
                localStorage.setItem('time', new Date().getTime());
            }
            this.setState(value);
        } else if (message === 'disconnected') {
            this.onDisConnect();
        }
    }

    onGameStart() {
        this.communicator.start();
    }

    render() {
        return (this.state.gameState === 'waiting') ? this.renderWaiting() : this.renderBoard();
    }

    renderBoard() {
        return (
            <div className="split">
                <div className="topPane">
                    <div>{this.state.order.join(' - ')}</div>
                    <div>{(this.state.storyTeller === this.state.id) ? 'You are story teller' : ''}</div>
                    <h1>Cards will show here</h1>
                </div>
                <div className="bottomPane">
                    <h1>Your hands {this.state.cards.join(', ')}</h1>
                </div>
            </div>

        );
    }

    renderWaiting() {
        return (
            <div className="App">

                <header className="App-header">
                    <a onClick={this.onGameStart}>{(this.state.isKing) ? 'Start' : ''}</a>
                    <h1>Waiting for people to join...</h1>
                    <div>{Object.keys(this.state.currentUsers).join(', ')}</div>
                </header>
            </div>
        );
    }
}