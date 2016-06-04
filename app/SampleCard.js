import React, { Component } from 'react';
import { render } from 'react-dom';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import BufferViewer from './BufferViewer';
import noUserSelect from './noUserSelect';
import { round } from './util';

export default class SampleCard extends Component {
  render() {
    let cardBody;

    if (this.props.sample) {
      cardBody =
        <CardText expandable={true} style={noUserSelect}>
          <Value
            title="Offset"
            value={this.props.sample.offset}
            onChange={this.offsetChanged}
          />

          <Value
            title="Length"
            value={this.props.sample.length}
            onChange={this.lengthChanged}
          />

          <Value
            title="Gain"
            value={this.props.sample.gain}
            onChange={this.gainChanged}
          />

          <Value
            title="Rate"
            value={this.props.sample.playbackRate}
            onChange={this.playbackRateChanged}
          />

          <Value
            title="Fade In"
            value={this.props.sample.fadeIn}
            onChange={this.fadeInChanged}
          />

          <Value
            title="Fade Out"
            value={this.props.sample.fadeOut}
            onChange={this.fadeOutChanged}
          />

          <BufferViewer
            buffer={this.props.buffer}
            select={this.props.select}
            offset={this.props.sample.offset}
            length={this.props.sample.length}
            width={this.props.width - 32}
            height={150}
          />

        </CardText>;
    } else {
      cardBody = ""
    }

    return (
      <Card
        style={Object.assign({
          width: this.props.width
        }, this.props.style)}
      >
        <CardHeader
          title="Sample Properties"
          subtitle={this.subtitle()}
          actAsExpander={true}
          showExpandableButton={true}
        />

        {cardBody}

      </Card>
    );
  }

  offsetChanged = (value) => {
    this.props.sample.offset = value;
    this.props.updated();
  }

  lengthChanged = (value) => {
    this.props.sample.length = value;
    this.props.updated();
  }

  gainChanged = (value) => {
    this.props.sample.gain = value;
    this.props.updated();
  }

  playbackRateChanged = (value) => {
    this.props.sample.playbackRate = value;
    this.props.updated();
  }

  fadeInChanged = (value) => {
    this.props.sample.fadeIn = value;
    this.props.updated();
  }

  fadeOutChanged = (value) => {
    this.props.sample.fadeOut = value;
    this.props.updated();
  }

  subtitle() {
    if (this.props.sample) {
      return "Selected sample: " + this.props.sample.name;
    } else {
      return "No sample selected";
    }
  }
}

class Value extends Component {
  labelStyle = {
    fontFamily: "Roboto",
    verticalAlign: "top",
    display: "inline-block",
    minWidth: 80,
    marginRight: 20,
    marginTop: 22
  }

  inputStyle = {
    width: 70,
    paddingTop: 5,
    verticalAlign: "top"
  }

  buttonStyle = {
    paddingTop: 19
  }

  iconStyle = {
    fontSize: 18
  }

  componentWillReceiveProps(props) {
    // Only set new state if value hasn't changed.
    // This is required for Safari, which won't allow
    // you to type "0." otherwise
    if (props.value != this.state.value) {
      this.setState({ value: props.value });
    }
  }

  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
  }

  onTextFieldChange = (event) => {
    const newValue = event.target.value;
    this.onChange(newValue);
  }

  onChange = (value) => {
    const rounded = round(value, 2);
    this.setState({ value: value });
    this.props.onChange(rounded);
  }

  increaseValue = () => {
    this.onChange(this.state.value + this.props.step);
  }

  decreaseValue = () => {
    this.onChange(this.state.value - this.props.step);
  }

  render() {
    return (
      <div style={{height: "50px"}}>
        <div style={this.labelStyle}>
          {this.props.title}
        </div>

        <TextField
          type="number"
          name={this.props.title}
          value={this.state.value}
          onChange={this.onTextFieldChange}
          style={this.inputStyle}
          step={this.props.step}
        />

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

  static defaultProps = {
    step: 0.01
  }
}
