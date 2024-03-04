import * as Tone from 'tone'
import { kickSynth } from '../instruments'
import { Level } from '.'

const LevelOne = new Level({
  beatInstrument: kickSynth,
  playBeat: () => kickSynth.triggerAttackRelease('C1', '8n'),
  track: new Tone.Player('tutorial-short.mp3').toDestination(),
  beatNotes: [
    {
      time: '0:0:0',
      blank: true,
    },
    { time: '1:0:0', blank: true },
    { time: '2:0:0', blank: true },
    { time: '3:0:0', blank: true },
    { time: '4:0:0' },
    { time: '5:0:0' },
    { time: '6:0:0' },
    { time: '7:0:0' },
    { time: '8:0:0' },
    { time: '8:1:0' },
    { time: '9:0:0' },
    { time: '9:1:0' },
    { time: '10:0:0' },
    { time: '11:0:0' },
  ],
})

export default LevelOne
