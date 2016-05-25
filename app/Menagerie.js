import {HarmonicSynth} from 'sine/synth';
import {ctx, getCurrentTime} from 'sine/audio';
import {Distortion, FeedbackDelay} from 'sine/fx';
import {connect} from 'sine/util';
import {SingleBufferSampler} from 'sine/sampler';
import getAudioBuffer from 'sine/ajax';
import {createBufferSource, createDelay, createDynamicsCompressor, createGain, createOscillator, createChannelSplitter, createChannelMerger} from 'sine/nodes';
import { MixNode, Node } from 'sine/util';
import _ from 'lodash';


const createTimeDomainAnalyser = (fftSize, interval, cb) => {
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

class LFO extends Node {
  constructor(frequency, gain = 1, real = 1, imag = 0) {
    super();

    const oscillatorGain = createGain(gain);
    const oscillator = createOscillator({
      frequency: frequency,
      realCoefficients: [real],
      imaginaryCoefficients: [imag]
    });
    connect(oscillator, oscillatorGain, this.output);
    oscillator.start();
  }
}

class Warper extends Node {
  constructor(lfoFrequency, amount, real, imag, letter) {
    super();

    const lfo = new LFO(lfoFrequency, 1, real, imag);

    const lfoGain = createGain(amount / 1000);

    const analyser = createTimeDomainAnalyser(2048, 100, (dataArray, avg) => {
      const x = Math.floor(2000 * avg) + 20;
      //console.log(new Array(x).join(" ") + letter);
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

class Multiplier extends MixNode {
  constructor(mix) {
    super(mix);
    const modulatorGain = createGain(1);
    const signalGain = createGain(0);
    connect(this.input, modulatorGain, signalGain.gain);

    connect(this.input, signalGain, this.wetMix);
  }
}

class AM extends MixNode {
  /*
  * @param frequency   Frequency to modulate the amplitude
  * @param amount      How much the amplitude modulates by
  * @param centerGain  The center-point of the signal gain that gets
  *                    modulated.
  *
  * E.g. if amount = 0.5 and centerGain = 0, the input signal will
  * have its gain varied between -0.5 and +0.5.
  */
  constructor(frequency, amount, centerGain=0) {
    super(0.4);
    const modulatorGain = createGain(amount);
    const signalGain = createGain(centerGain);
    this.modulator = createOscillator(frequency);
    this.modulator.start();

    connect(this.modulator, modulatorGain, signalGain.gain);

    connect(this.input, signalGain, this.wetMix);
  }
}

// Tremolo is just AM with center gain set to 1
class Tremolo extends AM {
  constructor(frequency, amount) {
    super(frequency, amount, 1);
  }
}

class FxChain extends Node {
  constructor() {
    super();

    this.fx = {
      chorus: new StereoChorus(0.5, 5),
      multiplier: new Multiplier(0.4),
      tremolo: new Tremolo(5, 0.3),
      distortion: new Distortion(1.5),
      delay: new FeedbackDelay(),
      compressor: createDynamicsCompressor(),
      am: new AM(2000, 1)
    };

    const lfo = new LFO(0.7, 1000);
    const am2 = new AM(0.3, 1);

    // Modulate LFO with AM then use that signal to
    // modulate main AM's modulator frequency
    connect(lfo, am2, this.fx.am.modulator.frequency);

    this.connectNodes();
  }

  disconnectNodes() {
    this.input.disconnect();

    Object.keys(this.fx).forEach(key => {
      this.fx[key].disconnect();
    });
  }

  connectNodes(nodeNames=[]) {
    // Disconnect all nodes so they can be re-connected
    this.disconnectNodes();

    connect(
      this.input,
      ...nodeNames.map(name => this.fx[name]),
      this.output
    );
  }
}

class Cissy {
  constructor(fxChain, buffers) {
    this.bufferPromise = buffers.then(b => b.cissyStrut);
    this.fxChain = fxChain;
  }

  play(onended) {
    this.stop();

    this.bufferPromise.then(buffer => {
      this.cissySource = createBufferSource(buffer);
      connect(this.cissySource, this.fxChain);
      this.cissySource.start();

      if (onended) {
        this.cissySource.onended = onended;
      }
    });
  }

  stop() {
    try {
      this.cissySource && this.cissySource.stop();
    } catch (e) {} // Safari throws an error
  }
}

const loadBuffers = () => {
  const fileNames = {
    beatIt:      'beatit.mp3',
    cissyStrut:  'cissy-strut-start.mp3',
    eileen:      'eileen.mp3',
    everyBreath: 'everybreath.mp3',
    notInLove:   'notinlove.mp3'
  };

  // Returns a Promise of an object of buffer names to buffers
  return Promise.all(_.toPairs(fileNames).map(([name, fileName]) =>
    getAudioBuffer(fileName).then(buff => [name, buff])
  )).then(bufferArray => _.fromPairs(bufferArray));
}

// TODO: show loading spinner, only show SamplerControl after loaded
// TODO: allow sampler to be held down for note on/off ?
// TODO: each key should have multiple attributes (offset, length, gain, adsr?, playbackrate)
class Samplers extends Node {
  constructor(buffers) {
    super();

    this.buffers = buffers;

    this.notInLove = this.createSampler('notInLove', {
      1: 0.5,   2: 2,    3: 3,      4: 3.5,
      Q: 4.98,  W: 5.5,  E: 10.03,  R: 10.55,
      A: 27.25, S: 30,   D: 31,     F: 31.8,
      Z: 33.55,  X: 34.2, C: 37.1,   V: 40.61
    });

    this.notInLove.then(x => window.notInLove = x);
  }


  play = (sample) => {
    this.notInLove.then(sampler => {
      //sampler.play(sample, 0, 0.2, 0.8)
      //sampler.play(sample, 0, 0.2, 1.2)
      sampler.play(sample, 0, 0.2);
    });
  }

  playAtPosition = (position) => {
    this.notInLove.then(sampler => {
      sampler.playOffset(sampler.buffer.duration * position, 0, 0.2);
    });
  }

  createSampler(fileName, offsets) {
    return this.buffers.then(buffers => {
      const sampler = new SingleBufferSampler(buffers[fileName], offsets);
      connect(sampler, this.output);
      return sampler;
    });
  }
}

export default class Menagerie {
  constructor() {
    this.fxChain = new FxChain();
    this.setPreset1();

    this.buffers = loadBuffers();

    this.cissy = new Cissy(this.fxChain, this.buffers);

    this.synth = new HarmonicSynth({
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    }, [1, 1, 1, 1, 1]);

    this.samplers = new Samplers(this.buffers);
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
      'compressor'
    ]);
  }

  setPreset3 = () => {
    this.fxChain.connectNodes([
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
