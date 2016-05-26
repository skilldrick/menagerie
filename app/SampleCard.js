import React, { Component } from 'react';
import { render } from 'react-dom';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

export default class SampleCard extends Component {
  render() {
    return (
      <Card
        style={{
          maxWidth: this.props.width,
          marginBottom: 20
        }}
      >
        <CardHeader
          title="Sample Properties"
          subtitle={this.subtitle()}
          actAsExpander={true}
          showExpandableButton={true}
        />

        <CardText expandable={true}>

        </CardText>
      </Card>
    );
  }

  subtitle() {
    if (this.props.sample) {
      return this.props.sample;
    } else {
      return "No sample selected";
    }
  }
}
