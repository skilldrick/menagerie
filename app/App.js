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
import Footer from './Footer';

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
          <div>
            <RaisedButton
              label="Play Note"
              onTouchTap={this.playNote}
              disabled={!this.state.loaded}
            />
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
            <RaisedButton
              label="Preset 1"
              onTouchTap={() => this.menagerie.setPreset1()}
              disabled={!this.state.loaded}
            />
            <RaisedButton
              label="Preset 2"
              onTouchTap={() => this.menagerie.setPreset2()}
              disabled={!this.state.loaded}
            />
            <RaisedButton
              label="Preset 3"
              onTouchTap={() => this.menagerie.setPreset3()}
              disabled={!this.state.loaded}
            />
          </div>

          <div>
            <SampleCard
              sample={this.state.currentSample}
              buffer={this.state.buffer}
              select={this.playSampleAtPosition}
              updated={this.sampleUpdated}
              width={430}
            />
          </div>

          <div>
            <SamplerControl
              playSample={this.playSample}
              disabled={!this.state.loaded}
            />
          </div>

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

  playNote = () => {
    this.menagerie.playNote();
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
    this.state.currentSample.offset = this.round(offset, 2);
    this.sampleUpdated();
  }

  sampleUpdated = () => {
    this.setState({ currentSample: this.state.currentSample });
    this.playSample(this.state.currentSample.name);
  }

  round = (value, decimalPlaces) => {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.floor(value * multiplier) / multiplier;
  }
}

render(<App />, document.getElementById('root'));
