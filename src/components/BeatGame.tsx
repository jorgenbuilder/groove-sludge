import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { GroupProps, useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store'
import React from 'react'
import TimingGrade from './TimingGrade'
import { isInThreshold, processTexture } from '../util'

interface Props extends GroupProps {}

export function BeatGame({ ...props }: Props) {
  const {
    size: { width, height },
  } = useThree()

  const { beats, bpm, shots, addShot } = useGameStore()

  const texBeatRow = useTexture('/beat-row.png', processTexture)
  const texBeatCursor = useTexture('/beat-cursor.png', processTexture)

  const visibleBeats = beats.filter((time) => isInThreshold(time, bpm))
  const visibleShots = shots.filter(([time]) => isInThreshold(time, bpm))

  const meshes = React.useRef<{ [key: number]: THREE.Mesh }>({})

  const shoot = React.useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key !== ' ') return
      const now = Date.now()
      const nearestBeatDelta = visibleBeats.reduce(
        (acc, x) => Math.min(acc, Math.abs(x - now)),
        visibleBeats[0]
      )
      const value: 0 | 1 | 2 = nearestBeatDelta < 50 ? 2 : nearestBeatDelta < 150 ? 1 : 0

      addShot([now, value])
    },
    [visibleBeats]
  )

  React.useEffect(() => {
    window.addEventListener('keydown', shoot)

    // Mock up some... beats
    const t = setInterval(() => {
      useGameStore.getState().addBeat(Date.now() + (60_000 / bpm) * 2)
    }, (60_000 / bpm) * 4)

    return () => {
      window.removeEventListener('keydown', shoot)
      clearInterval(t)
    }
  }, [shoot])

  const cursorPos = [-width / 2 + height * 0.25, 0, 0] as const

  useFrame(() => {
    const now = Date.now()

    for (const time in meshes.current) {
      // Clean up old refs
      if (!isInThreshold(Number(time), bpm)) {
        delete meshes.current[time]
        return
      }

      // Set position of visible meshes
      // X position is a function of beat time and current actual time
      const mesh = meshes.current[time]!
      const delta = (width * (Number(time) - now)) / 1000
      mesh.position.setX(cursorPos[0] + delta)
    }
  })

  return (
    <>
      <group {...props}>
        {/* Beat row */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[width, height * 0.25]} />
          <meshBasicMaterial map={texBeatRow} />
        </mesh>
        {/* Beat squares */}
        {visibleBeats.map((time) => (
          <mesh
            key={`beat-${time}`}
            ref={(el) => {
              if (!el) return
              meshes.current[time] = el
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
