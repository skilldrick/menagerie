import _ from 'lodash';

import { HarmonicSynth } from 'sine/synth';
import { ctx, getCurrentTime } from 'sine/audio';
import { connect } from 'sine/util';
import { SingleBufferSampler } from 'sine/sampler';
import getAudioBuffer from 'sine/ajax';
import { createBufferSource } from 'sine/nodes';
import { Node } from 'sine/util';

import FxChain from './fx';
import Pattern from './Pattern';

class Cissy {
  constructor(fxChain, cissyBuffer) {
    this.buffer = cissyBuffer;
    this.fxChain = fxChain;
  }

  play(onended) {
    this.stop();

    this.cissySource = createBufferSource(this.buffer);
    connect(this.cissySource, this.fxChain);
    this.cissySource.start();

    if (onended) {
      this.cissySource.onended = onended;
    }
  }

  stop() {
    try {
      this.cissySource && this.cissySource.stop();
    } catch (e) {} // Safari throws an error
  }
}

const loadInitialBuffers = () => {
  const fileNames = {
    cissyStrut:  'cissy-strut-start.mp3',
    impulse:     'conic_echo_long_hall_short.mp3',
    notInLove:   'notinlove.mp3'
  };

  // Returns a Promise of an object of buffer names to buffers
  return Promise.all(_.toPairs(fileNames).map(([name, fileName]) =>
    getAudioBuffer(fileName).then(buff => [name, buff])
  )).then(bufferArray => _.fromPairs(bufferArray));
}

// TODO: allow sampler to be held down for note on/off ?

const samplerFactories = {
  notInLove: (buffer) => {
    const sampler = new SingleBufferSampler(buffer, {
      1: 0.5,    2: 2,     3: 3,      4: 3.5,
      Q: 4.98,   W: 5.5,   E: 10.03,  R: 10.55,
      A: 27.25,  S: 30,    D: 31,     F: 31.8,
      Z: 33.55,  X: 34.2,  C: 37.1,   V: 40.61
    });

    // Override the quiter samples to be louder
    sampler.setGains({
      1: 4,  2: 4,  3: 4,  4: 4,
      Q: 2,  W: 2,  E: 2,  R: 2
    });

    return sampler;
  },

  eileen: () => {
    return getAudioBuffer('eileen.mp3').then(buffer => {
      const sampler = new SingleBufferSampler(buffer, {
        1: 0.5,    2: 2,     3: 3,      4: 3.5,
        Q: 4.98,   W: 5.5,   E: 10.03,  R: 10.55,
        A: 27.25,  S: 30,    D: 31,     F: 31.8,
        Z: 33.55,  X: 34.2,  C: 37.1,   V: 40.61
      });

      console.log(sampler);

      return sampler;
    });
  }
};

//TODO: make every track playable via cissy play/pause buttons

//beatIt:      'beatit.mp3',
//eileen:      'eileen.mp3',
//everyBreath: 'everybreath.mp3',
class Menagerie {
  constructor(buffers) {
    const { cissyStrut, impulse, notInLove } = buffers;
    this.fxChain = new FxChain(impulse);

    this.cissy = new Cissy(this.fxChain, cissyStrut);

    this.synth = new HarmonicSynth({
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    }, [1, 1, 1, 1, 1]);

    this.samplers = {
      notInLove: samplerFactories.notInLove(notInLove)
    };

    this.currentSamplerName = 'notInLove';

    this.pattern = new Pattern(this.sampler());

    connect(this.fxChain, ctx.destination);

    connect(this.sampler(), this.fxChain);
    connect(this.synth, this.fxChain);
  }

  sampler = () => {
    return this.samplers[this.currentSamplerName];
  }

  changeSampler = (newSamplerName, cb) => {
    //TODO: normalize this so samplers always returns a promise?
    if (this.samplers[newSamplerName]) {
      // If we already have the sampler loaded, return immediately
      this.currentSamplerName = newSamplerName;
      cb();
    } else {
      // Otherwise load the sampler
      samplerFactories[newSamplerName]().then(sampler => {
        this.samplers[newSamplerName] = sampler;
        this.currentSamplerName = newSamplerName;
        connect(this.sampler(), this.fxChain);
        cb();
      });
    }
  }

  playSample = (sample) => {
    this.sampler().play(sample, 0);
  }

  playAtPosition = (position) => {
    const offset = this.sampler().buffer.duration * position;
    this.sampler().playOffset(offset, 0, 0.2);
  }

  playCissy(onended) {
    this.cissy.play(onended);
  }

  stopCissy() {
    this.cissy.stop();
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

  // not used
  playNote() {
    this.synth.playNote(3, getCurrentTime(), 2, Math.random() * 10);
  }
}

export default loadInitialBuffers().then((buffers) =>
  new Menagerie(buffers)
);
