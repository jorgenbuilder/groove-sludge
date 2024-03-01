import * as THREE from 'three'
import { GroupProps, useFrame } from '@react-three/fiber'
import { useDimensions } from '../util'
import React from 'react'
import { useGameStore } from '../store'
import AudioPlayer from './Audio'

export interface Props extends GroupProps {}

/**
 * Create targets for the tone game.
 *
 * - Make something show up
 * - Add target element to tone track for every beat
 * - Determine target tone for each beat (should ultimate come from the sequencer but mock it)
 * - Only play tone if cursor is on the right track
 * - Detune if cursor is off the track
 * -
 */

export default function ToneGame({ ...props }: Props) {
  const { moveCursorUp, moveCursorDown, toneCursorNormalized, toneGranularity } =
    useGameStore()
  const { width, height } = useDimensions()

  const cursorHeight = height(144 * 0.75) / toneGranularity

  React.useEffect(() => {
    function bind(ev: WheelEvent) {
      if (ev.deltaY > 0) moveCursorUp()
      if (ev.deltaY < 0) moveCursorDown()
    }

    window.addEventListener('wheel', bind)
    return () => window.removeEventListener('wheel', bind)
  }, [])

  const cursor = React.useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!cursor.current) return
    cursor.current.position.lerp(
      {
        x: cursor.current.position.x,
        y: height(144 * 0.75 - cursorHeight / 2.5) * toneCursorNormalized,
        z: 0,
      },
      0.1
    )
  })

  return (
    <group {...props}>
      <AudioPlayer />
      {/* Backdrop */}
      <mesh>
        <planeGeometry args={[width(256 * 0.34), height(144 * 0.75)]} />
        <meshBasicMaterial color='#191919' />
      </mesh>
      {/* Cursor column */}
      <mesh position={[-width((256 * 0.34) / 2 - 5 - 10), 0, 0]}>
        <planeGeometry args={[width(10), height(144 * 0.75)]} />
        <meshBasicMaterial color='#555' />
      </mesh>
      {/* Cursor */}
      <mesh position={[-width((256 * 0.34) / 2 - 5 - 10), 0, 0]} ref={cursor}>
        <planeGeometry args={[width(10), cursorHeight]} />
        <meshBasicMaterial color='#777' />
      </mesh>
    </group>
  )
}
