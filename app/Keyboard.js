import React, { Component } from 'react';

import _ from 'lodash';

export default class Keyboard extends Component {
  keys = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'E#', // dummy
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
    'B#' // dummy
  ];

  render() {
    const keyElements = this.keys.map((key, i) => {
      return (
        <KeyboardKey
          key={i}
          keyName={key}
          index={i}
          down={this.state.down}
          mouseDown={this.mouseDown}
          mouseUp={this.mouseUp}
          playNote={this.props.playNote}
          endNote={this.props.endNote}
        />
      );
    });

    return (
      <div
        style={{ position: 'relative' }}
      >
        {keyElements}
      </div>
    );
  }


  mouseDown = () => {
    this.setState({ down: true });
  }

  mouseUp = () => {
    this.setState({ down: false });
  }

  constructor() {
    super();
    this.state = { down: false };
  }
}

class KeyboardKey extends Component {
  render() {
    const width = 60;
    const blackWidth = width * 2 / 3;
    const height = 150;

    const isBlack = this.props.keyName[1] == '#';
    const isDummy = ['E#', 'B#'].includes(this.props.keyName);

    const sharedStyle = {
      display: 'inline-block',
      width: width,
      height: height,
      border: '1px solid black',
      position: 'relative',
      boxSizing: 'border-box',
      userDrag: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    };

    const whiteStyle = {
      backgroundColor: 'white',
      zIndex: 1,
      marginLeft: this.props.index ? -blackWidth - 1 : 0
    };

    const blackStyle = {
      width: blackWidth,
      left: -blackWidth / 2,
      verticalAlign: 'top',
      height: height * 2 / 3,
      backgroundColor: 'black',
      zIndex: 2
    };

    const dummyStyle = {
      visibility: 'hidden'
    };

    const style = Object.assign(
      sharedStyle,
      isBlack ? blackStyle : whiteStyle,
      isDummy ? dummyStyle : {}
    );

    return (
      <a
        style={style}
        //onTouchStart={this.noteStart}
        //onTouchEnd={this.noteEnd}
        //onMouseDown={('ontouchstart' in window) ? null : this.noteStart}
        //onMouseUp={('ontouchstart' in window) ? null : this.noteEnd}
        onMouseDown={this.mouseDown}
        onMouseUp={this.mouseUp}
        onMouseEnter={() => this.noteStart()}
        onMouseLeave={() => this.noteEnd()}
      ></a>
    );
  }

  mouseDown = () => {
    this.noteStart(true);
  }

  mouseUp = () => {
    this.noteEnd(true);
  }

  noteStart = (force=false) => {
    if (this.props.down || force) {
      this.props.mouseDown();
      this.props.playNote(this.props.keyName);
    }
  }

  noteEnd = (force=false) => {
    if (this.props.down || force) {
      this.props.mouseUp();
      this.props.endNote(this.props.keyName);
    }
  }
}
