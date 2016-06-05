// react stuff
import React, { Component } from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

// material-ui components
import { deepOrange500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';

import Sampler from './Sampler';
import FxControl from './FxControl';
import PatternSelector from './PatternSelector';
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

          <Sampler
            sampler={this.menagerie.currentSampler()}
            samplerName={this.menagerie.samplerManager.currentSamplerName}
            playFullSample={(onended) => this.menagerie.samplerManager.playFullSample(onended)}
            stopFullSample={this.menagerie.samplerManager.stopFullSample}
            playSample={this.menagerie.playSample}
            changeSampler={this.changeSampler}
            loadingBuffer={this.state.loadingBuffer}
            buffer={this.state.buffer}
          />

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

}

render(<App />, document.getElementById('root'));
