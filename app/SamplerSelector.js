import React, { Component, ReactDOM } from 'react';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class SamplerSelector extends Component {
  render() {
    return (
      <SelectField value={this.state.value} onChange={this.handleChange}>
        <MenuItem value={"notInLove"} primaryText="I'm Not In Love" />
        <MenuItem value={"eileen"}    primaryText="Come on Eileen" />
      </SelectField>
    );
  }

  constructor(props) {
    super(props);
    this.state = { value: props.initialValue };
  }

  handleChange = (e, index, value) => {
    this.props.changeSampler(value);
    this.setState({ value: value });
  }
}
