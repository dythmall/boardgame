import React from 'react';
import './App.css';
import Communicator from './Communicator';

export default class GameBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            users: {}
        }
        this.eventListener = this.eventListener.bind(this);
    }

    componentDidMount() {
        this.communicator = new Communicator(this.state.id, this.eventListener);
    }

    eventListener(message, value) {
        if (message === 'user.joined') {
            this.setState({users: value});
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Waiting for people to join...</h1>
                    <div>{Object.keys(this.state.users)}</div>
                </header>
            </div>
        );
    }
}