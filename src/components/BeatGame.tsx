import * as THREE from 'three'
import * as Tone from 'tone'
import { useTexture } from '@react-three/drei'
import { GroupProps, useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store'
import React from 'react'
import TimingGrade from './TimingGrade'
import { isInThreshold, processTexture, useDimensions } from '../util'
import StLouise from '../levels/one'
import { Level } from '../levels'

interface Props extends GroupProps {
  level: Level
}

export function BeatGame({ level, ...props }: Props) {
  const refactory = React.useRef(0)

  const {
    size: { width, height },
  } = useThree()

  const [drawBeats, setDrawBeats] = React.useState<
    { time: string; index: number; blank?: boolean }[]
  >([])

  const { bpm, shots, addShot } = useGameStore()

  const texBeatRow = useTexture('/beat-row.png', processTexture)
  const texBeatCursor = useTexture('/beat-cursor.png', processTexture)

  const visibleShots = shots.filter(([time]) => isInThreshold(time, bpm))

  const meshes = React.useRef<{ [key: number]: THREE.Mesh }>({})

  const shoot = React.useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key !== ' ') return
      if (Date.now() - refactory.current < 0) return
      const now = Tone.now()
      const nearestBeatDelta = drawBeats
        .filter((x) => !x.blank)
        .reduce((acc, x) => {
          const time = Tone.Time(x.time).toSeconds()
          return Math.min(acc, Math.abs(time - now))
        }, 1)
      const value: 0 | 1 | 2 =
        nearestBeatDelta < 0.1 ? 2 : nearestBeatDelta < 0.25 ? 1 : 0
      if (value === 2) {
        refactory.current = Date.now()
        // level.beatInstrument.volume.value = 0
        // try {
        //   level.beatInstrument.disconnect(crusher)
        // } catch {}
      } else if (value === 1) {
        refactory.current = Date.now()
        // level.beatInstrument.volume.value = -5
        // try {
        //   level.beatInstrument.disconnect(crusher)
        // } catch {}
      } else {
        refactory.current = Date.now() + 1000
        // level.beatInstrument.volume.value = -10
        // level.beatInstrument.connect(crusher)
      }
      level.playBeat()
      addShot([Date.now(), value])
    },
    [drawBeats]
  )

  React.useEffect(() => {
    function handleBeatUpdate(event: Event) {
      const { detail } = event as CustomEvent<
        { time: string; index: number; blank?: boolean }[]
      >
      setDrawBeats(detail)
    }
    window.addEventListener('keydown', shoot)
    level.addEventListener('beatUpdate', handleBeatUpdate)

    return () => {
      level.removeEventListener('beatUpdate', handleBeatUpdate)
      window.removeEventListener('keydown', shoot)
    }
  }, [shoot])

  React.useEffect(() => {
    level.start()
    return level.stop
  }, [])

  const cursorPos = [-width / 2 + height * 0.25, 0, 0] as const

  const { width: dWidth, height: dHeight } = useDimensions()

  useFrame(() => {
    for (const i in meshes.current) {
      if (!drawBeats.find(({ index }) => index === Number(i))) {
        delete meshes.current[i]
      }
    }

    const now = Tone.now()

    let i = 0
    for (const [key, mesh] of Object.entries(meshes.current)) {
      const beatIndex = Number(key)
      const beat = drawBeats.find(({ index }) => index === beatIndex)
      if (!beat) continue

      const beatTime = Tone.Time(beat.time).toSeconds()
      const delta = beatTime - now
      const deltaMax = Tone.Time('4n').toSeconds() * 4
      const deltaNormalized = delta / deltaMax

      const posLeft = -width / 2 + height * 0.25
      const posRight = dWidth(256 / 2) + dWidth(18)

      mesh.position.x = THREE.MathUtils.lerp(posLeft, posRight, deltaNormalized)

      i++
    }
  })

  return (
    <>
      <group {...props}>
        {/* Beat row */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[width, height * 0.25]} />
          <meshBasicMaterial map={texBeatRow} toneMapped={false} />
        </mesh>
        {/* Beat squares */}
        {drawBeats
          .filter((x) => !x.blank)
          .map(({ index }) => (
            <mesh
              key={`beat-${index}`}
              ref={(el) => {
                if (!el) return
                meshes.current[index] = el
              }}
              position={[width, 0, 0]}
            >
              <planeGeometry args={[height * 0.25, height * 0.25]} />
              <meshBasicMaterial color='#81e4c6' />
            </mesh>
          ))}
        {/* Beat cursor */}
        <mesh position={cursorPos}>
          <planeGeometry args={[height * 0.25, height * 0.25]} />
          <meshBasicMaterial map={texBeatCursor} transparent />
        </mesh>
        {visibleShots.map(([time, grade]) => (
          <TimingGrade key={`shot-${time}`} grade={grade} position={cursorPos} />
        ))}
      </group>
    </>
  )
}
