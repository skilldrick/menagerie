import React, { Component, ReactDOM } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';

export default class PatternSelector extends Component {
  checkboxStyle = {
    flex: 'flex-shrink',
    width: 'auto',
    marginRight: 20,
    marginBottom: 10
  }

  render() {
    const patternIds = this.props.pattern.patterns.map((pattern, i) => i);

    const checkBoxes = patternIds.map(i =>
      (<Checkbox
        label={String(i)}
        key={i}
        style={this.checkboxStyle}
        labelStyle={{width: '100%'}}
        defaultChecked={this.props.pattern.patternIds.has(i)}
        onCheck={(e, isChecked) => this.props.setPattern(i, isChecked)}
      />)
    );

    return (
      <div>
        <RaisedButton
          label="Play Pattern"
          onTouchTap={this.playPattern}
        />
        <RaisedButton
          label="Stop Pattern"
          onTouchTap={this.stopPattern}
        />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          marginTop: 12
        }}>
          {checkBoxes}
        </div>
      </div>
    );
  }

  playPattern = () => {
    this.props.playPattern();
  }

  stopPattern = () => {
    this.props.stopPattern();
  }

}
