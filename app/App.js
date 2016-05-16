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
import getAudioBuffer from 'sine/ajax';
import {createBufferSource, createDelay, createGain, createOscillator, createChannelSplitter, createChannelMerger} from 'sine/nodes';
import {Node} from 'sine/util';

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

export const createTimeDomainAnalyser = (fftSize, interval, cb) => {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = fftSize;

  const dataArray = new Float32Array(analyser.frequencyBinCount);

  setInterval(() => {
    analyser.getFloatTimeDomainData(dataArray);
    let total = 0;
    let squares = 0;

    for (let i = 0; i < dataArray.length; i++) {
      let value = dataArray[i];
      total += value;
      squares += value * value;
    }

    // Array, mean value, RMS value)
    cb(dataArray, total / dataArray.length, Math.sqrt(squares / dataArray.length));
  }, interval);

  return analyser;
};

const createLFO = (frequency, real, imag) => createOscillator({
  frequency: frequency,
  realCoefficients: [real],
  imaginaryCoefficients: [imag]
});

class Warper extends Node {
  constructor(lfoFrequency, amount, real, imag, letter) {
    super();

    const lfo = createLFO(lfoFrequency, real, imag);
    lfo.start();

    const lfoGain = createGain(amount / 1000);

    const analyser = createTimeDomainAnalyser(2048, 100, (dataArray, avg) => {
      const x = Math.floor(2000 * avg) + 20;
      console.log(new Array(x).join(" ") + letter);
    });

    this.delay = createDelay(2, 0.001);

    connect(lfo, lfoGain, analyser, this.delay.delayTime);
    connect(this.input, this.delay, this.output);
  }
}

class Splitter extends Node {
  constructor() {
    super();

    const splitter = createChannelSplitter();
    const merger = createChannelMerger();
    this.inputL = createGain();
    this.inputR = createGain();
    this.outputL = createGain();
    this.outputR = createGain();

    connect(this.input, splitter);

    splitter.connect(this.inputL, 0);
    splitter.connect(this.inputR, 1);

    this.outputL.connect(merger, 0, 0);
    this.outputR.connect(merger, 0, 1);

    connect(merger, this.output);
  }
}

class StereoChorus extends Node {
  // http://www.soundonsound.com/sos/jun04/articles/synthsecrets.htm
  constructor(lfoFrequency, amount) {
    super();

    const splitter = new Splitter();
    const gain = createGain(0.5);

    // Create 3 warpers with different phase offsets
    const warper1 = new Warper(lfoFrequency, amount, -1, 1, '1');
    const warper2 = new Warper(lfoFrequency, amount, 1, 1, '2');
    const warper3 = new Warper(lfoFrequency, amount, 1, -1, '3');

    // Connect inputL to warper1 and warper 2
    // Connect inputR to warper2 and warper 3
    connect(splitter.inputL, warper1);
    connect(splitter.inputL, warper2);
    connect(splitter.inputR, warper2);
    connect(splitter.inputR, warper3);

    // Connect warper1 and warper2 to outputL
    // Connect warper2 and warper3 to outputR
    connect(warper1, splitter.outputL);
    connect(warper2, splitter.outputL);
    connect(warper2, splitter.outputR);
    connect(warper3, splitter.outputR);

    connect(this.input, gain, splitter, this.output);
  }
}

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

    getAudioBuffer('cissy-strut-start.mp3').then((buffer) => {
      const source = createBufferSource(buffer);
      const chorus = new StereoChorus(500, 0.5);
      connect(source, chorus, ctx.destination);
      source.start();
    });
  }


  play = () => {
    this.synth.playNote(10, getCurrentTime(), 1, Math.random() * 10);
  }
}

render(<App />, document.getElementById('root'));
