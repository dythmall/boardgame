import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import GameBoard from './GameBoard';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', password: '', id: null};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);

  }

  onDisConnect() {
    this.setState({id: null});
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
    xhr.open('POST', 'http://localhost:9000/users')
    xhr.setRequestHeader('Content-Type', 'application/json');
    // send the request
    xhr.send(JSON.stringify({
      name: this.state.name,
      password: this.state.password
    }));
  }

  componentDidMount() {
    const creationTime = localStorage.getItem('time');
    if (creationTime && new Date().getTime() - creationTime < 10000) {
      const id = localStorage.getItem('id');
      this.setState({id});
    }
  }

  render() {
    if (this.state.id) {
      return (
        <GameBoard id={this.state.id} onDisConnect={this.onDisConnect}/>
      )
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <form onSubmit={this.handleSubmit}>
            <label>
              Name: <input value={this.state.name} type="text" name="name" onChange={this.handleInput} />
            </label>
            <label>
              Password: <input value={this.state.password} type="password" name="password" onChange={this.handleInput} />
            </label>
            <input type="submit" value="Submit" />
          </form>
          <div id="error"></div>
        </header>
      </div>
    );
  }
}

export default App;
