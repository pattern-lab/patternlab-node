import React, { Component } from 'react';

import HelloWorld from '../../atoms/general/HelloWorld';

// const HelloWorld = () => (
//   <div>
//     Hello world!
//   </div>
// );

class HelloIncluder extends Component {
  constructor() {
    super();
    this.state = {
      bgColor: 'transparent',
    };
    setTimeout(() => this.setState({ bgColor: 'red' }), 2000);
  }

  render() {
    return (
      <div style={{ backgroundColor: this.state.bgColor }}>
        <div>Hey! Here's the Hello World component:</div>
        <HelloWorld />
      </div>
    );
  }
}

export default HelloIncluder;
