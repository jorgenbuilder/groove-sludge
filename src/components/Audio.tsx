import * as Tone from 'tone'
import { useGameStore } from '../store'
import React from 'react'

const tones = ['C3', 'E3', 'G3']

const synthA = new Tone.FMSynth().toDestination()
synthA.volume.value = -32

export default function AudioPlayer() {
  const { bpm } = useGameStore(({ toneCursor, bpm }) => ({ toneCursor, bpm }))

  React.useEffect(() => {
    const loopA = new Tone.Loop((time) => {
      const { toneCursor, setCurrTone, currTone } = useGameStore.getState()
      const tone = tones[toneCursor - 1]
      setCurrTone(tone)
      if (currTone === tone) return
      synthA.triggerRelease()
      synthA.triggerAttack(tone)
    }, '4n').start(0)

    Tone.Transport.start()

    return () => {
      loopA.stop()
      Tone.Transport.stop()
    }
  }, [bpm])

  Tone.Transport.bpm.value = bpm
  return null
}
