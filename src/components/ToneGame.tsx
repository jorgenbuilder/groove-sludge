import * as THREE from 'three'
import * as Tone from 'tone'
import { GroupProps, useFrame } from '@react-three/fiber'
import { normalizeTone, useDimensions } from '../util'
import React from 'react'
import { useGameStore } from '../store'
import AudioPlayer from './Audio'

export interface Props extends GroupProps {
  flat: () => void
  root: () => void
  sharp: () => void
  drawTones: { time: string; cursor: number; index: number; blank?: boolean }[]
}

const beats = [
  { time: '0:0:0', cursor: 2, blank: true },
  { time: '1:0:0', cursor: 2, blank: true },
  { time: '2:0:0', cursor: 2, blank: true },
  { time: '3:0:0', cursor: 2, blank: true },
  { time: '4:0:0', cursor: 2, blank: true },
  { time: '5:0:0', cursor: 2, blank: true },
  { time: '6:0:0', cursor: 1, blank: true },
  { time: '7:0:0', cursor: 2, blank: true },
  { time: '8:0:0', cursor: 2, blank: true },
  { time: '6:0:0', cursor: 1, blank: true },
]

export default function ToneGame({ drawTones, ...props }: Props) {
  const { moveCursorUp, moveCursorDown, toneCursorNormalized, toneGranularity } =
    useGameStore()
  const { width, height } = useDimensions()

  const cursorHeight = height(144 * 0.75) / toneGranularity

  React.useEffect(() => {
    Tone.Transport.start()

    function bind(ev: WheelEvent) {
      if (ev.deltaY > 0) moveCursorUp()
      if (ev.deltaY < 0) moveCursorDown()
    }

    function bind2(ev: KeyboardEvent) {
      if (ev.key === 'ArrowUp') moveCursorDown()
      if (ev.key === 'ArrowDown') moveCursorUp()
    }

    window.addEventListener('keydown', bind2)
    window.addEventListener('wheel', bind)
    return () => {
      window.removeEventListener('wheel', bind)
      window.removeEventListener('keydown', bind2)
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
      if (!drawTones.find(({ index }) => index === Number(i))) {
        delete targetBeatRefs.current[i]
      }
    }
    const now = Tone.now()
    let i = 0
    for (const [key, mesh] of Object.entries(targetBeatRefs.current)) {
      const beatIndex = Number(key)
      const beat = drawTones.find(({ index }) => index === beatIndex)
      if (!beat) continue

      const beatTime = Tone.Time(beat.time).toSeconds()
      const delta = beatTime - now
      const deltaMax = Tone.Time('4n').toSeconds() * 4
      const deltaNormalized = delta / deltaMax
      if (beatIndex === 5 || beatIndex === 10) {
        if (elapsedTime - lastLog.current > 0.5) {
          lastLog.current = elapsedTime
        }
      }

      const posLeft =
        (width(256 * 0.34) / 5) * 0 - width(256 * 0.34) / 2 + width(256 * 0.34) / 5 / 2
      const posRight =
        (width(256 * 0.34) / 5) * 4 - width(256 * 0.34) / 2 + width(256 * 0.34) / 5 / 2

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
      {drawTones
        .filter((x) => !x.blank)
        .map(({ cursor, index }, j) => (
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
