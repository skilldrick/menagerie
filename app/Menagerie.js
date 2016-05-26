import _ from 'lodash';

import { HarmonicSynth } from 'sine/synth';
import { ctx, getCurrentTime } from 'sine/audio';
import { connect } from 'sine/util';
import { SingleBufferSampler } from 'sine/sampler';
import getAudioBuffer from 'sine/ajax';
import { createBufferSource } from 'sine/nodes';
import { Node } from 'sine/util';

import FxChain from './fx';

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
class Samplers extends Node {
  constructor(buffers) {
    super();

    this.buffers = buffers;

    this.notInLove = this.createSampler(this.buffers.notInLove, {
      1: 0.5,   2: 2,    3: 3,      4: 3.5,
      Q: 4.98,  W: 5.5,  E: 10.03,  R: 10.55,
      A: 27.25, S: 30,   D: 31,     F: 31.8,
      Z: 33.55,  X: 34.2, C: 37.1,   V: 40.61
    });
  }


  play = (sample) => {
    this.notInLove.play(sample, 0, 0.2);
  }

  playAtPosition = (position) => {
    const offset = this.notInLove.buffer.duration * position;
    this.notInLove.playOffset(offset, 0, 0.2);
  }

  createSampler(buffer, offsets) {
    const sampler = new SingleBufferSampler(buffer, offsets);
    connect(sampler, this.output);
    return sampler;
  }
}

class Menagerie {
  constructor(buffers) {
    this.buffers = buffers;
    this.fxChain = new FxChain(buffers);
    this.setPreset1();

    this.cissy = new Cissy(this.fxChain, buffers);

    this.synth = new HarmonicSynth({
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    }, [1, 1, 1, 1, 1]);

    this.samplers = new Samplers(buffers);
    connect(this.samplers, this.fxChain);

    connect(this.synth, this.fxChain, ctx.destination);
  }

  playSample = (sample) => {
    this.samplers.play(sample);
  }

  playAtPosition = (position) => {
    this.samplers.playAtPosition(position);
  }

  setPreset1 = () => {
    this.fxChain.connectNodes([
      'chorus',
      'multiplier',
      'tremolo',
    ]);
  }

  setPreset2 = () => {
    this.fxChain.connectNodes([
      'chorus',
      'multiplier',
      'tremolo',
      'distortion',
      'delay',
      'reverb',
      'compressor'
    ]);
  }

  setPreset3 = () => {
    this.fxChain.connectNodes([
      'reverb',
      'am',
      'multiplier',
      'chorus',
      'tremolo',
      'compressor',
      'delay',
      'distortion',
    ]);
  }

  playCissy(onended) {
    this.cissy.play(onended);
  }

  stopCissy() {
    this.cissy.stop();
  }

  playNote() {
    this.synth.playNote(3, getCurrentTime(), 2, Math.random() * 10);
  }
}

export default loadBuffers().then((buffers) =>
    new Menagerie(buffers)
  );
