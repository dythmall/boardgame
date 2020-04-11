import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import GameBoard from './GameBoard';
import './App.css';
import Strings from './Strings';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', password: '', id: null, language: 'en'};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.onDisConnect = this.onDisConnect.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.strings = new Strings(this.state.language);
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

  onDisConnect() {
    this.setState({id: null});
    this.restorePreviousId();
  }

  handleInput(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    if(this.areFieldsCorrect()) {
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
    const element = <h3 style={{color: "red"}}>{message}</h3>;
    ReactDOM.render(element, document.getElementById('error'));
  }

  login() {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest()

    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      // update the state of the component with the result here
      if (xhr.status === 401) {
        this.printError('Wrong password!')
      } else if (xhr.status === 409) {
        this.printError(`${this.state.name} is already in use.`);
      } else if (xhr.status === 410) {
        this.printError('Game already in place');
      } else if (xhr.status === 200) {
        console.log(xhr.responseText);
        this.setState({
          id: JSON.parse(xhr.responseText).id
        })
      }
    })

    // open the request with the verb and the url
    xhr.open('POST', `http://${window.location.hostname}/users`)
    xhr.setRequestHeader('Content-Type', 'application/json');
    // send the request
    xhr.send(JSON.stringify({
      name: this.state.name,
      password: this.state.password
    }));
  }

  restorePreviousId() {
    const creationTime = localStorage.getItem('time');
    if (creationTime && new Date().getTime() - creationTime < 3600000) {
      const id = localStorage.getItem('id');
      this.setState({id});
    }
  }

  componentDidMount() {
    this.restorePreviousId();
  }

  render() {
    if (this.state.id) {
      return (
        <GameBoard id={this.state.id} onDisConnect={this.onDisConnect} language={this.state.language} />
      )
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div><button onClick={this.changeLanguage}>{ this.state.language === 'en' ? '한글' : 'English' }</button></div>
          <form onSubmit={this.handleSubmit}>
            <div>
              <input placeholder={this.strings.getText('name')} value={this.state.name} type="text" name="name" onChange={this.handleInput} />
            </div>
            <div>
              <input placeholder={this.strings.getText('password')} value={this.state.password} type="password" name="password" onChange={this.handleInput} />
            </div>
            <input type="submit" value="Submit" />
          </form>
          <div id="error"></div>
        </header>
      </div>
    );
  }
}

export default App;
