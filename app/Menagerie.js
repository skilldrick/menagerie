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
  constructor(fxChain, buffers) {
    this.buffer = buffers.cissyStrut;
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

const loadBuffers = () => {
  const fileNames = {
    //beatIt:      'beatit.mp3',
    cissyStrut:  'cissy-strut-start.mp3',
    impulse:     'conic_echo_long_hall_short.mp3',
    //eileen:      'eileen.mp3',
    //everyBreath: 'everybreath.mp3',
    notInLove:   'notinlove.mp3'
  };

  // Returns a Promise of an object of buffer names to buffers
  return Promise.all(_.toPairs(fileNames).map(([name, fileName]) =>
    getAudioBuffer(fileName).then(buff => [name, buff])
  )).then(bufferArray => _.fromPairs(bufferArray));
}

// TODO: allow sampler to be held down for note on/off ?
// TODO: each key should have multiple attributes (offset, length, gain, adsr?, playbackrate)
class Samplers {
  constructor(buffers) {
    this.buffers = buffers;

    this.notInLove = this.createSampler(this.buffers.notInLove, {
      1: 0.5,    2: 2,     3: 3,      4: 3.5,
      Q: 4.98,   W: 5.5,   E: 10.03,  R: 10.55,
      A: 27.25,  S: 30,    D: 31,     F: 31.8,
      Z: 33.55,  X: 34.2,  C: 37.1,   V: 40.61
    });

    // Override the quiter samples to be louder
    this.notInLove.setGains({
      1: 4,  2: 4,  3: 4,  4: 4,
      Q: 2,  W: 2,  E: 2,  R: 2
    });
  }

  createSampler(buffer, offsets) {
    return new SingleBufferSampler(buffer, offsets);
  }
}

class Menagerie {
  constructor(buffers) {
    this.buffers = buffers;
    this.fxChain = new FxChain(buffers);

    this.cissy = new Cissy(this.fxChain, buffers);

    this.synth = new HarmonicSynth({
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    }, [1, 1, 1, 1, 1]);

    this.sampler = new Samplers(buffers).notInLove;

    this.pattern = new Pattern(this.sampler);

    connect(this.fxChain, ctx.destination);

    connect(this.sampler, this.fxChain);
    connect(this.synth, this.fxChain);
  }

  playSample = (sample) => {
    this.sampler.play(sample, 0);
  }

  playAtPosition = (position) => {
    const offset = this.sampler.buffer.duration * position;
    this.sampler.playOffset(offset, 0, 0.2);
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

export default loadBuffers().then((buffers) =>
    new Menagerie(buffers)
  );
