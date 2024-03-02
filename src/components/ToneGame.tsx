import * as THREE from 'three'
import * as Tone from 'tone'
import { GroupProps, useFrame } from '@react-three/fiber'
import { normalizeTone, useDimensions } from '../util'
import React from 'react'
import { useGameStore } from '../store'
import AudioPlayer from './Audio'

export interface Props extends GroupProps {}

/**
 * Create targets for the tone game.
 *
 * - Make something show up and move across the track
 * - Add target element to tone track for every beat
 * - Determine target tone for each beat (should ultimate come from the sequencer but mock it)
 * - Only play tone if cursor is on the right track
 * - Detune if cursor is off the track
 * -
 */

export default function ToneGame({ ...props }: Props) {
  const {
    bpm,
    moveCursorUp,
    moveCursorDown,
    toneCursorNormalized,
    toneGranularity,
    toneCursor,
  } = useGameStore()
  const { width, height } = useDimensions()

  const [targetBeats, setTargetBeats] = React.useState<number[]>([1, 2, 3, 2, 1])
  const nextBeat = React.useRef<number>(0)

  const cursorHeight = height(144 * 0.75) / toneGranularity

  React.useEffect(() => {
    function bind(ev: WheelEvent) {
      if (ev.deltaY > 0) moveCursorUp()
      if (ev.deltaY < 0) moveCursorDown()
    }

    const beatSpawner = new Tone.Loop((time) => {
      const { toneGranularity } = useGameStore.getState()
      const update = [...targetBeats]
      update.shift()
      update.push(Math.ceil(Math.random() * toneGranularity))
      setTargetBeats(update)
      // Translate
      nextBeat.current = Tone.now() + 60 / bpm / 4
    }, '1n').start(0)

    window.addEventListener('wheel', bind)
    return () => {
      window.removeEventListener('wheel', bind)
      beatSpawner.stop()
    }
  }, [targetBeats])

  const cursor = React.useRef<THREE.Mesh>(null)

  const targetBeatRefs = React.useRef<THREE.Mesh[]>([])

  useFrame(() => {
    if (!cursor.current) return
    cursor.current.position.lerp(
      {
        ...cursor.current.position,
        y:
          (height(144 * 0.75) - height((144 * 0.75) / toneGranularity)) *
          toneCursorNormalized,
      },
      0.1
    )

    // Position target beat meshes on x axis
    // TODO: Refactor this to push a new mesh that animates all the way across
    if (!targetBeatRefs.current) return
    const now = Tone.now()
    let i = 0
    for (const mesh of targetBeatRefs.current) {
      // mesh.position.lerp(
      //   {
      //     ...mesh.position,
      //     x:
      //       (width(256 * 0.34) / 5) * i -
      //       width(256 * 0.34) / 2 +
      //       width(256 * 0.34) / 5 / 2 +
      //       width(((nextBeat.current - now) * 1000) / bpm),
      //   },
      //   0.1
      // )
      mesh.position.x =
        (width(256 * 0.34) / 5) * i -
        width(256 * 0.34) / 2 +
        width(256 * 0.34) / 5 / 2 +
        width(((nextBeat.current - now) * 1000) / bpm)
      i++
    }
  })

  return (
    <group {...props}>
      <AudioPlayer />
      {/* Backdrop */}
      <mesh>
        <planeGeometry args={[width(256 * 0.34), height(144 * 0.75)]} />
        <meshBasicMaterial color='#191919' toneMapped={false} />
      </mesh>
      {/* Cover up */}
      <mesh position={[-width(256 * 0.34) / 2 - width(40 / 2), 0, 1]}>
        <planeGeometry args={[width(40), height(144 * 0.75)]} />
        <meshBasicMaterial color='#021912' toneMapped={false} />
      </mesh>
      {/* Cursor column */}
      <mesh position={[-width((256 * 0.34) / 2 - 5 - 10), 0, 0]}>
        <planeGeometry args={[width(10), height(144 * 0.75)]} />
        <meshBasicMaterial color='#191919' toneMapped={false} />
      </mesh>
      {/* Cursor */}
      <mesh position={[-width((256 * 0.34) / 2 - 5 - 10), 0, 1]} ref={cursor}>
        <planeGeometry args={[width(10), cursorHeight]} />
        <meshBasicMaterial color='#777' toneMapped={false} />
      </mesh>
      {/* Target beats */}
      {targetBeats.map((tone, i) => (
        <mesh
          ref={(el) => {
            if (el) targetBeatRefs.current[i] = el
          }}
          key={`beat-${i}`}
          position={[
            (width(256 * 0.34) / 5) * i -
              width(256 * 0.34) / 2 +
              width(256 * 0.34) / 5 / 2 +
              (((nextBeat.current - Tone.now()) * 1000) / bpm) * 4,
            normalizeTone(tone, toneGranularity) * height(144 * 0.75) -
              normalizeTone(tone, toneGranularity) *
                height((144 * 0.75) / toneGranularity),
            0,
          ]}
        >
          <planeGeometry args={[width(256 * 0.34) / 5, cursorHeight]} />
          <meshBasicMaterial color={'#333'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
