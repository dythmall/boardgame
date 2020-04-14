import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import GameBoard from './GameBoard';
import './App.css';
import Strings from './Strings';
import Communicator from './Communicator';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      id: null,
      language: 'en',
      gameName: '',
      gameId: null,
      screen: 'login',
      games: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.createGame = this.createGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.eventListener = this.eventListener.bind(this);
    this.strings = new Strings(this.state.language);
    this.communicator = null;
  }

  eventListener(event, data) {
    if (event === 'disconnected') {
      this.onDisconnect();
    } else if (event === 'gamelist') {
      console.log(data);
      this.setState({ games: data })
    } else if (event === 'end') {
      localStorage.clear();
      this.communicator = new Communicator(this.eventListener, window.location.hostname);
      this.setState({screen: 'login'});
    }
  }

  changeLanguage(e) {
    e.preventDefault();
    if (this.state.language === 'en') {
      this.strings = new Strings('ko');
      this.setState({ language: 'ko' });
    } else {
      this.strings = new Strings('en');
      this.setState({ language: 'en' });
    }
  }

  onDisconnect() {
    if (!this.restorePreviousId()) {
      this.login();
    }
  }

  handleInput(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    if (this.areFieldsCorrect()) {
      this.login();
    }
    event.preventDefault();
  }

  areFieldsCorrect() {
    if (!this.state.name) {
      this.printError('Please enter your name');
      return false;
    }

    if (!this.state.password) {
      this.printError('Please enter password');
      return false;
    }

    return true;
  }

  printError(message) {
    const element = <h3 style={{ color: "red" }}>{message}</h3>;
    ReactDOM.render(element, document.getElementById('error'));
  }

  post(url, data, callback) {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest()

    // get a callback when the server responds
    xhr.addEventListener('load', () => callback(xhr));

    // open the request with the verb and the url
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/json');
    // send the request
    xhr.send(JSON.stringify(data));
  }

  login() {
    if (!this.state.name || !this.state.password) {
      this.setState({screen: 'login'});
      return;
    }
    const data = {
      name: this.state.name,
      password: this.state.password,
      id: this.state.id,
    };
    this.post(`http://${window.location.hostname}/users`, data, (xhr) => {
      // update the state of the component with the result here
      if (xhr.status === 401) {
        this.printError('Wrong password!')
      } else if (xhr.status === 409) {
        this.printError(`${this.state.name} is already in use.`);
      } else if (xhr.status === 410) {
        this.printError('Game already in place');
      } else if (xhr.status === 200) {
        console.log(xhr.responseText);
        const response = JSON.parse(xhr.responseText);
        this.communicator.setEventListener(this.eventListener);
        this.communicator.login(response.id);
        this.setState({
          id: response.id,
          games: response.games,
          gameId: null,
          screen: 'gamelist'
        });
      }
    });
  }

  restorePreviousId() {
    const creationTime = localStorage.getItem('time');
    if (creationTime && new Date().getTime() - creationTime < 3600000) {
      const id = localStorage.getItem('id');
      const gameId = localStorage.getItem('gameId');
      this.setState({ id, gameId, screen: 'waiting' });
      return true;
    }
    return false;
  }

  componentDidMount() {
    if (this.communicator == null) {
      this.communicator = new Communicator(this.eventListener, window.location.hostname);
    } else {
      this.communicator.setEventListener(this.eventListener);
    }
    this.restorePreviousId();
  }

  createGame(e) {
    e.preventDefault();
    this.post(`http://${window.location.hostname}/games`, { gameName: this.state.gameName }, (xhr) => {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        const response = JSON.parse(xhr.responseText)
        this.setState({
          gameId: response.id,
          screen: 'waiting',
        });
      }
    });
  }

  joinGame(e, game) {
    this.setState({
      gameId: game.id,
      screen: 'waiting'
    });
    e.preventDefault();
  }

  makeGameList() {
    return this.state.games.map(game => {
      if (game.state === 'waiting') {
        return <div className='info' key={game.id}><button onClick={(e) => this.joinGame(e, game)}>{game.name}: {game.users.join(' ')}</button></div>
      }
      return <div className='info' key={game.id}>{game.name}</div>;
    });
  }

  renderGameList() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>{this.strings.getText('games')}</h1>
          <div>
            <input placeholder={this.strings.getText('gameName')} value={this.state.gameName} type="text" name="gameName" onChange={this.handleInput} />
            <button className="resetButton" onClick={this.createGame}>{this.strings.getText('create')}</button>
          </div>
          {this.makeGameList()}
        </header>
      </div>
    );
  };

  renderLogin() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div><button onClick={this.changeLanguage}>{this.state.language === 'en' ? '한글' : 'English'}</button></div>
          <form onSubmit={this.handleSubmit}>
            <div>
              <input className="login" placeholder={this.strings.getText('name')} value={this.state.name} type="text" name="name" onChange={this.handleInput} />
            </div>
            <div>
              <input className="login" placeholder={this.strings.getText('password')} value={this.state.password} type="password" name="password" onChange={this.handleInput} />
            </div>
            <input type="submit" value="Submit" />
          </form>
          <div id="error"></div>
        </header>
      </div>
    );
  }

  renderWaiting() {
    return (
      <GameBoard 
        id={this.state.id}
        gameId={this.state.gameId}
        language={this.state.language}
        onDisconnect={this.onDisconnect}
        communicator={this.communicator}
      />
    );
  }

  render() {
    if (this.state.screen === 'gamelist') {
      return this.renderGameList();
    }
    if (this.state.screen === 'waiting') {
      return this.renderWaiting();
    }
    return this.renderLogin();
  }
}

export default App;
