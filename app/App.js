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

import Menagerie from './Menagerie';

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
          <RaisedButton label="Play Note" onTouchTap={this.playNote} />
          <RaisedButton
            label="Play Cissy Strut"
            onTouchTap={this.playCissy}
            disabled={this.state.playingCissy}
          />
          <RaisedButton
            label="Stop Cissy Strut"
            onTouchTap={this.stopCissy}
            disabled={!this.state.playingCissy}
          />
          <RaisedButton
            label="Preset 1"
            onTouchTap={this.menagerie.setPreset1}
          />
          <RaisedButton
            label="Preset 2"
            onTouchTap={this.menagerie.setPreset2}
          />
        </div>
      </MuiThemeProvider>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      playingCissy: false
    };

    this.menagerie = new Menagerie();
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
}

render(<App />, document.getElementById('root'));
