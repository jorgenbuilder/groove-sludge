import * as Tone from 'tone'

export const snareSynth = new Tone.NoiseSynth({
  noise: {
    type: 'white',
  },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.0,
    release: 0.2,
  },
  volume: -10,
}).toDestination()

export const clickSynth = new Tone.NoiseSynth({
  noise: {
    type: 'white',
  },
  envelope: {
    attack: 0.01,
    decay: 0.05,
    sustain: 0.0,
    release: 0.0125,
  },
  volume: -24,
}).toDestination()

export const kickSynth = new Tone.MembraneSynth({
  octaves: 4,
  oscillator: {
    type: 'sine',
  },
}).toDestination()

const kickReverb = new Tone.Reverb({
  decay: 3,
}).toDestination()

// kickSynth.connect(kickReverb)

const reverb = new Tone.Reverb({
  decay: 1,
}).toDestination()
snareSynth.connect(reverb)
