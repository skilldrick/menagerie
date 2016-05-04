// react stuff
import React, { Component } from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

// material-ui components
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {HarmonicSynth} from 'sine/synth';
import {ctx, getCurrentTime} from 'sine/audio';
import {connect} from 'sine/util';

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
        <RaisedButton label="Play" onTouchTap={this.play} />
      </MuiThemeProvider>
    );
  }

  constructor() {
    super();

    this.synth = new HarmonicSynth({
      attack: 0.1,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    }, [1, 1, 1, 1, 1]);

    connect(this.synth, ctx.destination);
  }


  play = () => {
    this.synth.playNote(10, getCurrentTime(), 1, Math.random() * 10);
  }
}

render(<App />, document.getElementById('root'));
