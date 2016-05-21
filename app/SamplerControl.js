import React, { Component } from 'react';
import { render } from 'react-dom';

import CircularProgress from 'material-ui/CircularProgress';

export default class SamplerControl extends Component {
  samples = [
    ['1', '2', '3', '4'],
    ['Q', 'W', 'E', 'R'],
    ['A', 'S', 'D', 'F'],
    ['Z', 'X', 'C', 'V'],
  ]

  render() {
    return this.props.disabled ?
      this.renderDisabled() :
      this.renderEnabled();
  }

  renderDisabled() {
    return (<div style={{width: 425, height: 425, display: 'flex'}}>
      <div style={{margin: 'auto'}}>
        <CircularProgress />
      </div>
    </div>);
  }

  renderEnabled() {
    return (<div>
      {this.samples.map((row, i) =>
        (<Row
          row={row}
          key={i}
          playSample={this.props.playSample}
          disabled={this.props.disabled}
        />)
      )}
    </div>);
  }
}

class Row extends Component {
  style = {
    clear: 'both',
  }

  render() {
    return (<div style={this.style}>
      {this.props.row.map((keyName, i) =>
        (<Pad
          keyName={keyName}
          key={i}
          playSample={this.props.playSample}
          disabled={this.props.disabled}
        />)
      )}
    </div>);
  }
}

// Represents a single pad in the sampler
class Pad extends Component {
  constructor(props) {
    super(props);
    this.state = { highlight: false };
  }

  style = () => {
    return {
      width: '100px',
      height: '100px',
      margin: '4px',
      display: 'table',
      float: 'left',
      cursor: 'pointer',
      backgroundColor: this.state.highlight ? '#BBDEFB' : '#42A5F5',
      transition: 'all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
      //boxSizing: 'border-box',
      fontFamily: 'Roboto, sans-serif',
      boxShadow: '0 1px 6px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.12)',
      borderRadius: '2px',
    }
  }

  innerStyle = {
    display: 'table-cell',
    textAlign: 'center',
    verticalAlign: 'middle',
  }

  render() {
    return (
      <div
        style={this.style()}
        className="pad"
        onTouchStart={this.handleClick}
        onMouseDown={('ontouchstart' in window) ? null : this.handleClick}
      >
        <div style={this.innerStyle}>
          {this.props.keyName}
        </div>
      </div>
    );
  }

  playSample() {
    this.props.playSample(this.props.keyName);
    this.addHighlight();
    setTimeout(this.removeHighlight, 60);
  }

  handleClick = () => {
    this.playSample();
  }

  addHighlight = () => {
    this.setState({ highlight: true });
  }

  removeHighlight = () => {
    this.setState({ highlight: false });
  }

  isThisButton = event =>
    String.fromCharCode(event.which) === this.props.keyName;

  handleKeydown = event => {
    if (this.isThisButton(event)) {
      this.playSample();
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeydown);
  }
}
