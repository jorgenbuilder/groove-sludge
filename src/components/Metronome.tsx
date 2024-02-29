import { useFrame } from '@react-three/fiber'
import { Audio } from 'ts-audio'
import { useGameStore } from '../store'
import { isInThreshold } from '../util'
import React from 'react'

const click = Audio({ file: '/noise-click.mp3', volume: 0.5 })

export default function Metronome() {
  const { beats, bpm } = useGameStore()
  const playedBeats = React.useRef<number[]>([])
  const visibleBeats = beats.filter((time) => isInThreshold(time, bpm))

  useFrame(() => {
    const now = Date.now()

    for (const time of visibleBeats) {
      if (playedBeats.current?.includes(time)) continue
      if (time - now > 350) return
      click.play()
      playedBeats.current.push(time)
    }
  })

  return null
}
