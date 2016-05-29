import React, { Component, ReactDOM } from 'react';

import RaisedButton from 'material-ui/RaisedButton';

export default class FxControl extends Component {
  render() {
    return (
      <div>
        <RaisedButton
          label="Preset 1"
          onTouchTap={() => this.setPreset1()}
          disabled={this.props.disabled}
        />
        <RaisedButton
          label="Preset 2"
          onTouchTap={() => this.setPreset2()}
          disabled={this.props.disabled}
        />
        <RaisedButton
          label="Preset 3"
          onTouchTap={() => this.setPreset3()}
          disabled={this.props.disabled}
        />
      </div>
    );
  }

  setPreset1 = () => {
    this.props.fxChain.connectNodes([
      'chorus',
      'multiplier',
      'tremolo',
    ]);
  }

  setPreset2 = () => {
    this.props.fxChain.connectNodes([
      'chorus',
      'multiplier',
      'tremolo',
      'distortion',
      'delay',
      'reverb',
      'compressor'
    ]);
  }

  setPreset3 = () => {
    this.props.fxChain.connectNodes([
      'reverb',
      'am',
      'multiplier',
      'chorus',
      'tremolo',
      'compressor',
      'delay',
      'distortion',
    ]);
  }

}
