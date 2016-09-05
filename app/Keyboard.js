import React, { Component } from 'react';

import _ from 'lodash';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import noUserSelect from './noUserSelect';

export default class Keyboard extends Component {
  keys = [
    ['C',  'T', 84],
    ['C#', '6', 54],
    ['D',  'Y', 89],
    ['D#', '7', 55],
    ['E',  'U', 85],
    ['E#'], // dummy
    ['F',  'I', 73],
    ['F#', '9', 57],
    ['G',  'O', 79],
    ['G#', '0', 48],
    ['A',  'P', 80],
    ['A#', '-', 189],
    ['B',  '[', 219],
    ['B#'], // dummy
    ['C2', ']', 221],
  ];

  render() {
    const keyElements = this.keys.map(([note, keyName, keyCode], i) => {
      return (
        <KeyboardKey
          key={i}
          noteName={note}
          keyName={keyName}
          keyCode={keyCode}
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
      <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start'}}>
        <div
          style={{ flex: 'none', position: 'relative' }}
        >
          {keyElements}
        </div>

        <KeyboardControls
          initialValue="mellotron"
          style={{ flex: 'none', marginLeft: 20 }}
          changeSynth={this.props.changeSynth}
          changeOctave={this.props.changeOctave}
        />
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

class KeyboardControls extends Component {
  render() {
    return (
      <div style={this.props.style}>
        <SelectField
          value={this.state.value}
          onChange={this.handleChange}
        >
          <MenuItem value={"harmonic"}  primaryText="Harmonic Synth" />
          <MenuItem value={"fm"}        primaryText="FM Synth" />
          <MenuItem value={"mellotron"} primaryText="Mellotron" />
        </SelectField>

        <Octave
          value={0}
          onChange={this.props.changeOctave}
        />
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = { value: props.initialValue };
  }

  handleChange = (e, index, value) => {
    this.props.changeSynth(value);
    this.setState({ value: value });
  }
}

class Octave extends Component {
  labelStyle = {
    fontFamily: "Roboto",
    verticalAlign: "top",
    display: "inline-block",
    marginRight: 10,
    marginTop: 18
  }

  buttonStyle = {
    paddingTop: 19
  }

  iconStyle = {
    fontSize: 18
  }

  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
  }

  onChange = (value) => {
    this.setState({ value: value });
    this.props.onChange(value);
  }

  increaseValue = () => {
    this.onChange(this.state.value + 1);
  }

  decreaseValue = () => {
    this.onChange(this.state.value - 1);
  }

  render() {
    return (
      <div style={{height: "50px"}}>
        <div style={this.labelStyle}>
          Octave:
        </div>

        <div
          style={this.labelStyle}
        >{this.state.value}</div>

        <IconButton
          tooltip="Increase"
          style={this.buttonStyle}
          iconStyle={this.iconStyle}
          onTouchTap={this.increaseValue}
        >
          <FontIcon className="material-icons">add</FontIcon>
        </IconButton>

        <IconButton
          tooltip="Decrease"
          style={this.buttonStyle}
          iconStyle={this.iconStyle}
          onTouchTap={this.decreaseValue}
        >
          <FontIcon className="material-icons">remove</FontIcon>
        </IconButton>
      </div>
    );
  }
}

class KeyboardKey extends Component {
  render() {
    const width = 45;
    const blackWidth = width * 2 / 3;
    const height = 150;
    const borderWidth = 2;

    const isBlack = this.props.noteName[1] == '#';
    const isDummy = ['E#', 'B#'].includes(this.props.noteName);


    const sharedStyle = {
      display: 'inline-block',
      width: width,
      height: height,
      //border: 'solid black',
      //borderWidth: borderWidth,
      borderRadius: "0 0 5px 5px",
      position: 'relative',
      boxSizing: 'border-box',
      userDrag: 'none',

      cursor: 'pointer',
      backgroundColor: this.state.playing ? '#eee' : '#fff',
      transition: 'all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
      //boxSizing: 'border-box',
      fontFamily: 'Roboto, sans-serif',
      boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
      borderRadius: '2px',
      textAlign: 'center',
    };

    const whiteStyle = {
      //backgroundColor: this.state.playing ? 'red' : 'white',
      zIndex: this.state.playing ? 1 : 2,
      marginLeft: (this.props.index === 0) ? 0 : -blackWidth - borderWidth
    };

    const blackStyle = {
      width: blackWidth,
      left: -blackWidth / 2,
      verticalAlign: 'top',
      height: height * 2 / 3,
      backgroundColor: this.state.playing ? '#444' : '#555',
      color: '#ddd',
      zIndex: 3
    };

    const dummyStyle = {
      visibility: 'hidden'
    };

    const style = Object.assign(
      sharedStyle,
      noUserSelect,
      isBlack ? blackStyle : whiteStyle,
      isDummy ? dummyStyle : {}
    );

    return (
      <a
        style={style}
        onTouchStart={() => this.noteStart(true)}
        onTouchEnd  ={() => this.noteEnd(true)}
        onMouseDown ={window.ontouchstart !== undefined ? null : this.mouseDown}
        onMouseUp   ={window.ontouchstart !== undefined ? null : this.mouseUp}
        onMouseEnter={window.ontouchstart !== undefined ? null : () => this.noteStart()}
        onMouseLeave={window.ontouchstart !== undefined ? null : () => this.noteEnd()}
      >
        <span
          style={{position: 'absolute', bottom: 5, marginLeft: -5}}
        >{this.props.keyName}</span>
      </a>
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
      this.props.playNote(this.props.noteName);
      this.setState({ playing: true });
    }
  }

  noteEnd = (force=false) => {
    if (this.props.down || force) {
      this.props.mouseUp();
      this.props.endNote(this.props.noteName);
      this.setState({ playing: false });
    }
  }

  isThisButton = event =>
    event.which === this.props.keyCode;

  isInputEvent = event =>
    event.srcElement.nodeName == 'INPUT'

  handleKeydown = event => {
    if (this.isThisButton(event) && !this.isInputEvent(event) && !event.repeat) {
      this.noteStart(true);
    }
  }

  handleKeyup = event => {
    if (this.isThisButton(event) && !this.isInputEvent(event)) {
      this.noteEnd(true);
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('keyup', this.handleKeyup);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('keyup', this.handleKeyup);
  }

  constructor() {
    super();
    this.state = { playing: false };
  }
}
