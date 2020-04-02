import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', password: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);

  }

  handleInput(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    this.login();
    event.preventDefault();
  }

  login() {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest()

    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      // update the state of the component with the result here
      console.log(xhr.responseText)
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

  render() {
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
        </header>
      </div>
    );
  }
}

export default App;
