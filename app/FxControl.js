import React, { Component, ReactDOM } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';

export default class FxControl extends Component {
  fx = [
    { name: "reverb",     label: "Reverb" },
    { name: "am",         label: "Amplitude Modulation" },
    { name: "multiplier", label: "Multiplier" },
    { name: "chorus",     label: "Chorus" },
    { name: "tremolo",    label: "Tremolo" },
    { name: "compressor", label: "Compressor" },
    { name: "delay",      label: "Delay" },
    { name: "distortion", label: "Distortion" }
  ]

  fxChain = []

  render() {
    const fxBoxes = this.fx.map((el, i) => {
      return (<FxBox
        check={this.check}
        unCheck={this.unCheck}
        name={el.name}
        label={el.label}
        key={i}
      />);
    });

    return (
      <div style={Object.assign({
        display: 'flex',
        flexWrap: 'wrap'
      }, this.props.style)}>
        {fxBoxes}
      </div>
    );
  }

  fxByName = (name) => this.fx.find(el => el.name == name);

  check = (name) => {
    this.fxByName(name).checked = true;
    this.connectFx();
  }

  unCheck = (name) => {
    this.fxByName(name).checked = false;
    this.connectFx();
  }

  connectFx = () => {
    const nodes = this.fx.filter(el => el.checked).map(el => el.name);
    this.props.fxChain.connectNodes(nodes);
  }
}

class FxBox extends Component {
  render() {
    return <Checkbox
      label={this.props.label}
      style={{flex: 'flex-shrink', width: 'auto', marginRight: 20, marginBottom: 10}}
      labelStyle={{width: '100%'}}
      onCheck={this.onCheck}
    />
  }

  onCheck = (e, isChecked) => {
    if (isChecked) {
      this.props.check(this.props.name);
    } else {
      this.props.unCheck(this.props.name)
    }
  }

}
