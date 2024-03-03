import * as THREE from 'three'
import * as Tone from 'tone'
import { useTexture } from '@react-three/drei'
import { GroupProps, useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store'
import React from 'react'
import TimingGrade from './TimingGrade'
import { isInThreshold, processTexture, useDimensions } from '../util'

const beats = [
  { time: '0:0:0', note: 'C1', blank: true },
  { time: '1:0:0', note: 'C1' },
  { time: '2:0:0', note: 'C1' },
  { time: '3:0:0', note: 'C1' },
  { time: '4:0:0', note: 'C1' },
  { time: '5:0:0', note: 'C1' },
  { time: '6:0:0', note: 'C1' },
  { time: '7:0:0', note: 'C1' },
]

const clickSynth = new Tone.NoiseSynth({
  noise: {
    type: 'white',
  },
  envelope: {
    attack: 0.01,
    decay: 0.05,
    sustain: 0.0,
    release: 0.0125,
  },
  volume: -24,
}).toDestination()

const snareSynth = new Tone.NoiseSynth({
  noise: {
    type: 'white',
  },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.0,
    release: 0.2,
  },
  volume: -10,
}).toDestination()

const reverb = new Tone.Reverb({
  decay: 1,
}).toDestination()
snareSynth.connect(reverb)

const metronomePart = new Tone.Part(
  (time) => {
    clickSynth.triggerAttackRelease('32n', time)
  },
  ['0:0:0']
)

metronomePart.loop = true
metronomePart.loopEnd = '0:1:0'

interface Props extends GroupProps {}

export function BeatGame({ ...props }: Props) {
  const crusher = React.useMemo(() => new Tone.BitCrusher(3.5).toDestination(), [])

  const relapse = React.useRef(0)

  const {
    size: { width, height },
  } = useThree()

  const [drawBeats, setDrawBeats] = React.useState<
    { time: string; note: string; index: number; blank?: boolean }[]
  >([])

  const part = React.useMemo(() => {
    const part = new Tone.Part((time, value) => {
      const now = part.progress * Tone.Time(part.loopEnd).toSeconds()
      Tone.Draw.schedule(function () {
        const i = beats.indexOf(value)
        setDrawBeats(beats.slice(i, i + 3).map((beat, j) => ({ ...beat, index: i + j })))
      }, time)

      if (value.blank) return
    }, beats)

    part.loop = true
    part.loopStart = 0
    part.loopEnd = '8:0:0'

    return part
  }, [beats])

  const { bpm, shots, addShot } = useGameStore()

  const texBeatRow = useTexture('/beat-row.png', processTexture)
  const texBeatCursor = useTexture('/beat-cursor.png', processTexture)

  const visibleShots = shots.filter(([time]) => isInThreshold(time, bpm))

  const meshes = React.useRef<{ [key: number]: THREE.Mesh }>({})

  const shoot = React.useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key !== ' ') return
      if (Date.now() - relapse.current < 500) return
      const now = part.progress * Tone.Time(part.loopEnd).toSeconds()
      const nearestBeatDelta = beats.reduce((acc, x) => {
        const time = Tone.Time(x.time).toSeconds()
        return Math.min(acc, Math.abs(time - now))
      }, 1)
      const value: 0 | 1 | 2 =
        nearestBeatDelta < 0.1 ? 2 : nearestBeatDelta < 0.25 ? 1 : 0
      if (value === 2) {
        relapse.current = Date.now()
        snareSynth.volume.value = -5
        try {
          snareSynth.disconnect(crusher)
        } catch {}
      } else if (value === 1) {
        relapse.current = Date.now()
        snareSynth.volume.value = -10
        try {
          snareSynth.disconnect(crusher)
        } catch {}
      } else {
        relapse.current = Date.now() + 1000
        snareSynth.volume.value = -20
        snareSynth.connect(crusher)
      }
      snareSynth.triggerAttackRelease('16n', Tone.now())
      addShot([Date.now(), value])
    },
    [drawBeats]
  )

  React.useEffect(() => {
    window.addEventListener('keydown', shoot)
    Tone.Transport.start()
    part.start(0)
    metronomePart.start(0)

    return () => {
      window.removeEventListener('keydown', shoot)
    }
  }, [shoot])

  const cursorPos = [-width / 2 + height * 0.25, 0, 0] as const

  const { width: dWidth, height: dHeight } = useDimensions()

  useFrame(() => {
    for (const i in meshes.current) {
      if (!drawBeats.find(({ index }) => index === Number(i))) {
        delete meshes.current[i]
      }
    }

    const now = part.progress * Tone.Time(part.loopEnd).toSeconds()

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
