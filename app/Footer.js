import React, { Component } from 'react';
import { render } from 'react-dom';
import logo from 'sine/logo';

export default class Footer extends Component {
  render() {
    return (
      <a
        href="https://github.com/skilldrick/sine"
        id="logo"
        style={{
          display: "block",
          marginTop: "150px",
          position: "relative"
        }}
      >
        <p
          style={{
            fontFamily: "Roboto, sans-serif",
            verticalAlign: "middle",
            position: "absolute",
            color: "black",
            left: "60px"
          }}
        >
          Powered by Sine
        </p>
      </a>
    )
  }

  componentDidMount() {
    logo(document.getElementById("logo"), 50);
  }
}
