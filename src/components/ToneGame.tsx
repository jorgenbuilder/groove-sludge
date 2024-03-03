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

const beats = [
  { time: '0:0:0', note: 'C3', cursor: 0 + 1 },
  { time: '0:1:0', note: 'C3', cursor: 0 + 1 },
  { time: '0:2:0', note: 'C3', cursor: 0 + 1 },
  { time: '0:3:0', note: 'C3', cursor: 0 + 1 },
  { time: '1:0:0', note: 'G3', cursor: 1 + 1 },
  { time: '1:1:0', note: 'G3', cursor: 1 + 1 },
  { time: '1:2:0', note: 'G3', cursor: 1 + 1 },
  { time: '1:3:0', note: 'G3', cursor: 1 + 1 },
  { time: '2:0:0', note: 'D4', cursor: 2 + 1 },
  { time: '2:1:0', note: 'D4', cursor: 2 + 1 },
  { time: '2:2:0', note: 'D4', cursor: 2 + 1 },
  { time: '2:3:0', note: 'D4', cursor: 2 + 1 },
]

export default function ToneGame({ ...props }: Props) {
  const { bpm, moveCursorUp, moveCursorDown, toneCursorNormalized, toneGranularity } =
    useGameStore()
  const { width, height } = useDimensions()

  const cursorHeight = height(144 * 0.75) / toneGranularity
  const [drawBeats, setDrawBeats] = React.useState<
    { time: string; note: string; cursor: number; index: number }[]
  >([])

  const part = React.useMemo(() => {
    const synth = new Tone.Synth().toDestination()
    const part = new Tone.Part((time, value) => {
      Tone.Draw.schedule(function () {
        // console.log(part.progress * Tone.Time(part.loopEnd).toSeconds())
        const i = beats.indexOf(value)
        setDrawBeats(beats.slice(i, i + 7).map((beat, j) => ({ ...beat, index: i + j })))
      }, time)

      // the value is an object which contains both the note and the velocity
      synth.triggerAttackRelease(value.note, '8n', time)
    }, beats)

    part.loop = true
    part.loopStart = 0
    part.loopEnd = '3:0:0'

    return part
  }, [beats])

  React.useEffect(() => {
    Tone.Transport.start()

    function bind(ev: WheelEvent) {
      if (ev.deltaY > 0) moveCursorUp()
      if (ev.deltaY < 0) moveCursorDown()
    }

    part.start(0)

    window.addEventListener('wheel', bind)
    return () => {
      window.removeEventListener('wheel', bind)
      part.stop().dispose()
      Tone.Transport.stop()
    }
  }, [])

  const cursor = React.useRef<THREE.Mesh>(null)

  const targetBeatRefs = React.useRef<{ [key: number]: THREE.Mesh }>({})
  const lastLog = React.useRef(0)

  useFrame(({ clock: { elapsedTime } }, dt) => {
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

    if (!targetBeatRefs.current) return
    for (const i in targetBeatRefs.current) {
      if (!drawBeats.find(({ index }) => index === Number(i))) {
        delete targetBeatRefs.current[i]
      }
    }
    const now = part.progress * Tone.Time(part.loopEnd).toSeconds()
    let i = 0
    for (const [key, mesh] of Object.entries(targetBeatRefs.current)) {
      const beatIndex = Number(key)
      const beat = drawBeats.find(({ index }) => index === beatIndex)
      if (!beat) continue

      const beatTime = Tone.Time(beat.time).toSeconds()
      const delta = beatTime - now
      const deltaMax = Tone.Time('4n').toSeconds() * 4
      const deltaNormalized = delta / deltaMax
      if (beatIndex === 5 || beatIndex === 10) {
        if (elapsedTime - lastLog.current > 0.5) {
          lastLog.current = elapsedTime
          console.log(deltaNormalized)
        }
      }

      const posLeft =
        (width(256 * 0.34) / 5) * 0 - width(256 * 0.34) / 2 + width(256 * 0.34) / 5 / 2
      const posRight =
        (width(256 * 0.34) / 5) * 4 - width(256 * 0.34) / 2 + width(256 * 0.34) / 5 / 2

      // if (deltaNormalized < 0) {
      //   mesh.position.x = posLeft
      //   continue
      // }

      // if (deltaNormalized > 1) {
      //   mesh.position.x = posRight
      //   continue
      // }

      // Interpolated
      mesh.position.x = THREE.MathUtils.lerp(posLeft, posRight, deltaNormalized)

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
      <mesh position={[width(256 * 0.34) / 2 + width(40 / 2), 0, 1]}>
        <planeGeometry args={[width(40), height(144 * 0.75)]} />
        <meshBasicMaterial color='#021912' toneMapped={false} />
      </mesh>
      {/* Cursor column */}
      <mesh position={[-width((256 * 0.34) / 2 - 5 - 10), 0, 0]}>
        <planeGeometry args={[width(10), height(144 * 0.75)]} />
        <meshBasicMaterial color='#191919' toneMapped={false} />
      </mesh>
      {/* Cursor */}
      <mesh
        position={[-width(256 * 0.34) / 2 + width(256 * 0.34) / 5 / 2, 0, 1]}
        ref={cursor}
      >
        <planeGeometry args={[width(256 * 0.34) / 5, cursorHeight]} />
        <meshBasicMaterial color='#777' toneMapped={false} />
      </mesh>
      {/* Target beats */}
      {drawBeats.map(({ cursor, index }, j) => (
        <mesh
          ref={(el) => {
            if (el) targetBeatRefs.current[index] = el
          }}
          key={`beat-${index}`}
          position={[
            (width(256 * 0.34) / 5) * j -
              width(256 * 0.34) / 2 +
              width(256 * 0.34) / 5 / 2,
            normalizeTone(cursor, toneGranularity) * height(144 * 0.75) -
              normalizeTone(cursor, toneGranularity) *
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
