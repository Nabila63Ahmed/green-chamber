import React from 'react';
import axios from 'axios';

class App extends React.Component {
  state = {};

  async componentDidMount() {
    const response = await axios.get('http://localhost:4000/api/ping');
    console.log(response);
  }

  render() {
    return <h1>Hello World</h1>;
  }
}

export default App;
