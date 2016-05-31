// react stuff
import React, { Component } from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

// material-ui components
import RaisedButton from 'material-ui/RaisedButton';
import { deepOrange500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

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
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <RaisedButton
            label="Play Cissy Strut"
            onTouchTap={this.playCissy}
            disabled={!this.state.loaded || this.state.playingCissy}
          />
          <RaisedButton
            label="Stop Cissy Strut"
            onTouchTap={this.stopCissy}
            disabled={!this.state.loaded || !this.state.playingCissy}
          />

          <FxControl
            fxChain={this.menagerie && this.menagerie.fxChain}
            disabled={!this.state.loaded}
            style={{margin: "20px 0"}}
          />

          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <SamplerControl
              playSample={this.playSample}
              disabled={!this.state.loaded}
              style={{flex: 'none', marginTop: 20, marginRight: 20}}
              width={350}
            />

            <SampleCard
              sample={this.state.currentSample}
              buffer={this.state.buffer}
              select={this.playSampleAtPosition}
              updated={this.sampleUpdated}
              style={{flex: 'none', marginTop: 20}}
              width={350}
            />
          </div>

          <PatternSelector
            loaded={this.state.loaded}
            menagerie={this.menagerie}
          />

          <Footer />
        </div>
      </MuiThemeProvider>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      playingCissy: false,
      loaded: false
    };
  }

  componentDidMount() {
    menageriePromise.then(menagerie => {
      this.menagerie = menagerie;
      this.setState({
        loaded: true,
        buffer: this.menagerie.sampler.buffer
      })
    });
  }

  playCissy = () => {
    this.setState({ playingCissy: true });
    this.menagerie.playCissy(this.stopCissy);
  }

  stopCissy = () => {
    this.setState({ playingCissy: false });
    this.menagerie.stopCissy();
  }

  setCurrentSample = (sampleName) => {
    const sample = this.menagerie.sampler.sampleMap[sampleName];
    this.setState({ currentSample: sample });
  }

  playSample = (sampleName) => {
    this.setCurrentSample(sampleName);
    this.menagerie.playSample(sampleName)
  }

  playSampleAtPosition = (position) => {
    const offset = this.menagerie.sampler.buffer.duration * position;
    this.state.currentSample.offset = round(offset, 2);
    this.sampleUpdated();
  }

  sampleUpdated = () => {
    this.setState({ currentSample: this.state.currentSample });
    this.playSample(this.state.currentSample.name);
  }
}

render(<App />, document.getElementById('root'));
