import React, { Component } from 'react';
import { render } from 'react-dom';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import BufferViewer from './BufferViewer';
import noUserSelect from './noUserSelect';

export default class SampleCard extends Component {
  render() {
    let cardBody;

    if (this.props.sample) {
      cardBody =
        <CardText expandable={true} style={noUserSelect}>
          <Value
            title="Offset"
            value={this.props.sample.offset}
          />

          <BufferViewer
            buffer={this.props.buffer}
            select={this.props.select}
            width={400}
            height={150}
          />

        </CardText>;
    } else {
      cardBody = ""
    }

    return (
      <Card
        style={{
          maxWidth: this.props.width,
          margin: "20px 0"
        }}
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

  subtitle() {
    if (this.props.sample) {
      return this.props.sample.name;
    } else {
      return "No sample selected";
    }
  }
}

class Value extends Component {
  labelStyle = {
    fontFamily: "Roboto",
    verticalAlign: "middle",
    display: "inline-block",
    minWidth: "80px",
    marginRight: "20px",
    paddingTop: "20px"
  }

  inputStyle = {
    width: "70px",
    paddingTop: "5px",
    verticalAlign: "top",
    marginLeft: "20px"
  }

  render() {
    return (
      <div style={{height: "50px"}}>
        <div style={this.labelStyle}>
          {this.props.title}
        </div>

        <TextField
          type="number"
          name="Name"
          value={this.props.value}
          onChange={(x) => console.log(x)}
          style={this.inputStyle}
          step={0.001}
        />
      </div>
    );
  }
}
