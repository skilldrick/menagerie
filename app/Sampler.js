import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

import SamplerSelector from './SamplerSelector';
import SamplerControl from './SamplerControl';
import SampleCard from './SampleCard';

import { round } from './util';

export default class Sampler extends Component {
  render() {
    if (this.props.loadingBuffer) {
      return this.renderLoading();
    } else {
      return this.renderEnabled();
    }
  }

  renderLoading() {
    const style = {
      marginBottom: 400 // Rough height of Sampler ¯\_(ツ)_/¯
    };

    return <CircularProgress style={style} />;
  }

  renderEnabled() {
    return (
      <div>
        <div style={{marginBottom: 20}}>
          <SamplerSelector
            style={{marginRight: 10}}
            initialValue={this.props.samplerName}
            changeSampler={this.props.changeSampler}
          />

          <RaisedButton
            label="Play Full Sample"
            style={{marginRight: 10}}
            onTouchTap={this.playFullSample}
            disabled={this.state.playingFullSample}
          />
          <RaisedButton
            label="Stop"
            onTouchTap={this.stopFullSample}
            disabled={!this.state.playingFullSample}
          />
        </div>


        <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start'}}>
          <SamplerControl
            playSample={this.playSample}
            style={{flex: 'none', marginRight: 20}}
            width={350}
          />

          <SampleCard
            sample={this.state.currentSample}
            buffer={this.props.buffer}
            select={this.playSampleAtPosition}
            updated={this.sampleUpdated}
            style={{flex: 'none'}}
            width={350}
          />
        </div>
      </div>
    );
  }

  playFullSample = () => {
    this.setState({ playingFullSample: true });
    this.props.playFullSample(this.stopFullSample);
  }

  stopFullSample = () => {
    this.setState({ playingFullSample: false });
    this.props.stopFullSample();
  }

  setCurrentSample = (sampleName) => {
    const sample = this.props.sampler.sampleMap[sampleName];
    this.setState({ currentSample: sample });
  }

  playSample = (sampleName) => {
    this.setCurrentSample(sampleName);
    this.props.playSample(sampleName)
  }

  playSampleAtPosition = (position) => {
    const offset = this.props.sampler.buffer.duration * position;
    this.state.currentSample.offset = round(offset, 2);
    this.sampleUpdated();
  }

  sampleUpdated = () => {
    this.setState({ currentSample: this.state.currentSample });
    this.props.playSample(this.state.currentSample.name);
  }

  constructor(props) {
    super(props);

    this.state = {
      playingFullSample: false
    };
  }
}
