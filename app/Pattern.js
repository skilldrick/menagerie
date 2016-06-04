import Scheduler from 'sine/scheduler';

export default class Pattern {
  patterns = [
  // |       |       |       |       |
    "Q Q W QQ WQQW W   R R ER E RE  E",
    "X XZX ZX ZXZC C X ZZXZZXZXZZC C ",
    "SASADASA"
    ]

  constructor(sampler) {
    this.sampler = sampler;

    this.scheduler = new Scheduler(400, (note, when) => {
      if (this.patternIds.has(note.id)) {
        this.sampler.play(note.sample, when);
      }
    });

    this.patterns.forEach((pattern, i) => {
      this.scheduler.addLoop(pattern.length, this.mapPattern(pattern, i));
    });

    this.patternIds = new Set([1]);
  }

  mapPattern = (pattern, id) =>
    pattern
      .split("")
      .map((sample, beatOffset) => (
        { beatOffset, sample, id }
      ))
      .filter((note) => note.sample !== ' ');

  play() {
    this.scheduler.start();
  }

  stop() {
    this.scheduler.stop();
  }
}
