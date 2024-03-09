import { useThree } from '@react-three/fiber'
import { useDimensions } from '../util'
import { BeatGame } from './BeatGame'
import ToneGame from './ToneGame'
import React from 'react'
import { SomedayLevel } from '../levels/someday'

const level = new SomedayLevel()

export default function FullGame() {
  const {
    size: { width, height },
  } = useThree()

  const [drawBeats, setDrawBeats] = React.useState<
    { time: string; index: number; blank?: boolean }[]
  >([])

  const [drawTones, setDrawTones] = React.useState<
    { time: string; cursor: number; index: number; blank?: boolean }[]
  >([])

  React.useEffect(() => {
    function handleBeatUpdate(event: Event) {
      const { detail } = event as CustomEvent<
        { time: string; index: number; blank?: boolean }[]
      >
      setDrawBeats(detail)
    }
    function handleToneUpdate(event: Event) {
      const { detail } = event as CustomEvent<
        { time: string; cursor: number; index: number; blank?: boolean }[]
      >
      setDrawTones(detail)
    }
    level.addEventListener('beatUpdate', handleBeatUpdate)
    level.addEventListener('toneUpdate', handleToneUpdate)

    return () => {
      level.removeEventListener('beatUpdate', handleBeatUpdate)
      level.removeEventListener('toneUpdate', handleToneUpdate)
    }
  }, [])

  React.useEffect(() => {
    level.start()
    return level.stop
  }, [])

  const { height: dHeight, width: dWidth } = useDimensions()
  return (
    <>
      <ToneGame
        drawTones={drawTones}
        flat={() => {}}
        root={() => {}}
        sharp={() => {}}
        position={[width * (0.5 - 0.34 / 2), height * (0.5 - 0.75 / 2), 0]}
      />
      <BeatGame
        position={[0, -height * (0.5 - 0.125), 0]}
        drawBeats={drawBeats}
        playBeat={level.playBeat}
      />
      <mesh position={[-dWidth(256 * 0.34) / 2, dHeight(144 * 0.25) / 2, 0.1]}>
        <planeGeometry args={[dWidth(256 * 0.66), dHeight(144 * 0.75)]} />
        <meshBasicMaterial color='black' />
      </mesh>
    </>
  )
}
