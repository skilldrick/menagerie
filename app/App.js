// react stuff
import React, { Component } from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

// material-ui components
import RaisedButton from 'material-ui/RaisedButton';
import { deepOrange500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';

import SamplerSelector from './SamplerSelector';
import SamplerControl from './SamplerControl';
import SampleCard from './SampleCard';
import FxControl from './FxControl';
import PatternSelector from './PatternSelector';
import Footer from './Footer';
import { round } from './util';

import menageriePromise from './Menagerie';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

class App extends Component {
  disabledStyle = {
    fontFamily: 'Roboto, sans-serif'
  }

  headingStyle = {
    fontFamily: 'Roboto, sans-serif'
  }

  render() {
    return this.state.loaded ?
      this.renderEnabled() :
      this.renderDisabled();
  }

  renderDisabled() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={this.disabledStyle}>
          <p>Loading Audio ...</p>
          <CircularProgress />
        </div>
      </MuiThemeProvider>);
  }

  renderEnabled() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <h2 style={this.headingStyle}>Global FX</h2>
          <FxControl
            fxChain={this.menagerie.fxChain}
            style={{margin: "20px 0"}}
          />

          <h2 style={this.headingStyle}>Sampler</h2>

          <div style={{marginBottom: 20}}>
            <SamplerSelector
              style={{marginRight: 10}}
              initialValue={this.menagerie.samplerManager.currentSamplerName}
              changeSampler={this.changeSampler}
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
              buffer={this.state.buffer}
              select={this.playSampleAtPosition}
              updated={this.sampleUpdated}
              style={{flex: 'none'}}
              width={350}
            />
          </div>

          <h2 style={this.headingStyle}>Patterns</h2>
          <PatternSelector
            pattern={this.menagerie.pattern}
            playPattern={this.menagerie.playPattern}
            stopPattern={this.menagerie.stopPattern}
            setPattern={this.menagerie.setPattern}
          />

          <Footer />
        </div>
      </MuiThemeProvider>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      playingFullSample: false,
      loadingBuffer: false,
      loaded: false
    };
  }

  componentDidMount() {
    menageriePromise.then(menagerie => {
      this.menagerie = menagerie;

      this.setState({
        loaded: true
      });

      this.setNewSampler();
    });
  }

  setNewSampler = () => {
    this.setState({
      buffer: this.menagerie.currentSampler().buffer,
      loadingBuffer: false,
      currentSample: null
    });
  }

  changeSampler = (name) => {
    this.setState({ loadingBuffer: true });
    this.menagerie.samplerManager.changeSampler(name).then(this.setNewSampler);
  }

  playFullSample = () => {
    this.setState({ playingFullSample: true });
    this.menagerie.samplerManager.playFullSample(this.stopFullSample);
  }

  stopFullSample = () => {
    this.setState({ playingFullSample: false });
    this.menagerie.samplerManager.stopFullSample();
  }

  setCurrentSample = (sampleName) => {
    const sample = this.menagerie.currentSampler().sampleMap[sampleName];
    this.setState({ currentSample: sample });
  }

  playSample = (sampleName) => {
    this.setCurrentSample(sampleName);
    this.menagerie.playSample(sampleName)
  }

  playSampleAtPosition = (position) => {
    const offset = this.menagerie.currentSampler().buffer.duration * position;
    this.state.currentSample.offset = round(offset, 2);
    this.sampleUpdated();
  }

  sampleUpdated = () => {
    this.setState({ currentSample: this.state.currentSample });
    this.playSample(this.state.currentSample.name);
  }
}

render(<App />, document.getElementById('root'));
