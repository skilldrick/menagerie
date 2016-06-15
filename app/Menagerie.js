import _ from 'lodash';

import { HarmonicSynth } from 'sine/synth';
import { ctx, getCurrentTime } from 'sine/audio';
import { connect } from 'sine/util';
import { SingleBufferSampler } from 'sine/sampler';
import getAudioBuffer from 'sine/ajax';
import { createBufferSource, createGain } from 'sine/nodes';
import { Node } from 'sine/util';

import FxChain from './fx';
import Pattern from './Pattern';

class PlayWholeBuffer extends Node {
  constructor(buffer) {
    super();
    this.buffer = buffer;
  }

  play(onended) {
    this.stop();

    this.source = createBufferSource(this.buffer);
    connect(this.source, this.output);
    this.source.start();

    if (onended) {
      this.source.onended = onended;
    }
  }

  stop() {
    try {
      this.source && this.source.stop();
    } catch (e) {} // Safari throws an error
  }
}

const loadInitialBuffers = () => {
  const fileNames = {
    impulse: 'conic_echo_long_hall_short.mp3'
  };

  // Returns a Promise of an object of buffer names to buffers
  return Promise.all(_.toPairs(fileNames).map(([name, fileName]) =>
    getAudioBuffer(fileName).then(buff => [name, buff])
  )).then(bufferArray => _.fromPairs(bufferArray));
}

// TODO: allow sampler to be held down for note on/off ?

class SamplerManager extends Node {
  definitions = {
    notInLove: {
      fileName: 'notinlove.mp3',
      offsets: {
        1: 0.5,    2: 2,     3: 3,      4: 3.5,
        Q: 4.98,   W: 5.5,   E: 10.03,  R: 10.55,
        A: 27.25,  S: 30,    D: 31,     F: 31.8,
        Z: 33.55,  X: 34.2,  C: 37.1,   V: 40.61
      },
      gains: {
        1: 4,  2: 4,  3: 4,  4: 4,
        Q: 2,  W: 2,  E: 2,  R: 2
      }
    },

    eileen: {
      fileName: 'eileen.mp3',
      offsets: {
        1: 2,     2: 2.3,  3: 2.8,   4: 3.4,
        Q: 3.74,  W: 4.3,  E: 4.84,  R: 5,
        A: 6,     S: 6.6,  D: 7.15,  F: 7.8,
        Z: 8.3,   X: 8.9,  C: 9.5,   V: 10.02
      }
    },

    beatIt: {
      fileName: 'beatit.mp3',
      offsets: {
        1: 0.55,   2: 4,      3: 12.34,  4: 11.92,
        Q: 14.13,  W: 14.55,  E: 16.72,  R: 17.1,
        A: 24.45,  S: 25.34,  D: 27.94,  F: 38.53,
        Z: 39.18,  X: 50,     C: 50.4,   V: 50.64
      }
    },

    cissy: {
      fileName: 'cissy-strut-start.mp3',
      offsets: {
        1: 35.52,    2: 42.73,     3: 38.45,      4: 51.61,
        Q: 50.24,   W: 1.4,   E: 8.5,  R: 3.68,
        //A: 27.25,  S: 30,    D: 31,     F: 31.8,
        //Z: 33.55,  X: 34.2,  C: 37.1,   V: 40.61
      },
      lengths: {
        1: 1.333, 2: 0.5, 3: 0.166, 4: 0.166,
        Q: 0.166, W: 1.2, E: 0.57, R: 0.2
      }
    }
  }

  constructor() {
    super();
    this.samplers = {};
  }

  // Returns a promise of a sampler
  loadSampler(samplerName) {
    const definition = this.definitions[samplerName];

    return getAudioBuffer(definition.fileName).then(buffer => {
      const sampler = new SingleBufferSampler(buffer, definition.offsets);
      sampler.setGains(definition.gains || {});
      sampler.setLengths(definition.lengths || {});
      connect(sampler, this.output);
      return sampler;
    });
  }

  cachedLoadSampler(samplerName) {
    if (this.samplers[samplerName]) {
      return Promise.resolve(this.samplers[samplerName]);
    } else {
      return this.loadSampler(samplerName).then(sampler => {
        this.samplers[samplerName] = sampler;
        return sampler;
      });
    }
  }

  changeSampler = (newSamplerName) => {
    return this.cachedLoadSampler(newSamplerName).then(sampler => {
      this.currentSamplerName = newSamplerName;
      this.setNewWholeBuffer(sampler.buffer);
      return sampler;
    });
  }

  current = () => {
    if (!this.currentSamplerName) {
      throw new Error("current() called before sampler loaded");
    }
    return this.samplers[this.currentSamplerName];
  }

  setNewWholeBuffer(buffer) {
    if (this.wholeBuffer) {
      this.wholeBuffer.stop();
    }

    this.wholeBuffer = new PlayWholeBuffer(buffer);
    connect(this.wholeBuffer, this.output);
  }

  playFullSample = (onended) => {
    if (!this.wholeBuffer) {
      throw new Error("playFullSample called before sampler loaded");
    }
    this.wholeBuffer.play(onended);
  }

  stopFullSample = () => {
    this.wholeBuffer.stop();
  }
}

class Menagerie {
  constructor(buffers) {
    const { impulse } = buffers;
    this.fxChain = new FxChain(impulse);

    this.synth = new HarmonicSynth({
      attack: 0.001,
      decay: 0.1,
      sustain: 0.4,
      release: 0.2
    }, [1, 1, 1, 1, 1]);

    const synthGain = createGain(0.5);

    this.samplerManager = new SamplerManager();

    connect(this.fxChain, ctx.destination);

    connect(this.samplerManager, this.fxChain);
    connect(this.synth, synthGain, this.fxChain);
  }

  // init returns a promise containing this instance
  init() {
    return this.samplerManager.changeSampler('cissy').then(cissy => {
      this.pattern = new Pattern('cissy', cissy);
      return this;
    });
  }

  currentSampler () {
    return this.samplerManager.current();
  }

  playSample = (sample) => {
    this.currentSampler().play(sample, 0);
  }

  playAtPosition = (position) => {
    const offset = this.currentSampler().buffer.duration * position;
    this.currentSampler().playOffset(offset, 0, 0.2);
  }

  playPattern() {
    this.pattern.play();
  }

  stopPattern() {
    this.pattern.stop();
  }

  setPattern(id, add) {
    if (add) {
      this.pattern.patternIds.add(id);
    } else {
      this.pattern.patternIds.delete(id);
    }
  }

  keys = [
    'A0', 'A#0', 'B0',
    'C', 'C#', 'D', 'D#', 'E',
    'F', 'F#', 'G', 'G#', 'A',
    'A#', 'B', 'C2'
  ]

  playNote = (note) => {
    // Stop note in 30 seconds in case note gets stuck
    const length = 30;
    this.synth.playNote(this.keys.indexOf(note), getCurrentTime(), length);
  }

  endNote = (note) => {
    this.synth.stopNote(this.keys.indexOf(note), getCurrentTime());
  }
}

export default loadInitialBuffers().then((buffers) => {
  const menagerie = new Menagerie(buffers);
  return menagerie.init();
});
