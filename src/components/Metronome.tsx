import * as Tone from 'tone'
import React from 'react'
import { clickSynth } from '../instruments'

const metronomePart = new Tone.Part(
  (time) => {
    clickSynth.triggerAttackRelease('32n', time)
  },
  ['0:0:0']
)

Tone.Transport.on('stop', () => {
  metronomePart.stop()
})

Tone.Transport.on('start', () => {
  metronomePart.start(0)
})

metronomePart.loop = true
metronomePart.loopEnd = '0:1:0'

export default function Metronome() {
  React.useEffect(() => {
    return () => {
      metronomePart.stop()
    }
  }, [])

  return null
}
