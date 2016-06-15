import Scheduler from 'sine/scheduler';

export default class Pattern {
  patterns = {
    notInLove: [
    // |       |       |       |       |
      "X XZX ZX ZXZC C X ZZXZZXZXZZC C ",
      "Q Q W QQ WQQW W   R R ER E RE  E",
      "SASADASA"
    ],
    cissy: [
    // |       |       |       |       |       |       |       |       |
      "E   R E E   R   E   R E E E R R E   R E  E  R   E   R E E E R R ",
      "444 4 44444 4 4 ",
      "3  3  3 ",
      "2       "
    ]
  }

  bpms = {
    notInLove: 400,
    cissy: 380
  }

  constructor(patternName, sampler) {
    this.sampler = sampler;

    this.scheduler = new Scheduler(this.bpms[patternName], (note, when) => {
      if (this.patternIds.has(note.id)) {
        this.sampler.play(note.sample, when);
      }
    });

    this.currentPatterns = this.patterns[patternName];

    this.currentPatterns.forEach((pattern, i) => {
      this.scheduler.addLoop(pattern.length, this.mapPattern(pattern, i));
    });


    this.patternIds = new Set([0]);
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
