import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { GroupProps, useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from './store'
import React from 'react'

interface Props extends GroupProps {}

function processTexture(tex: THREE.Texture) {
  tex.generateMipmaps = false
  tex.magFilter = THREE.NearestFilter
}

function isInThreshold(time: number, bpm: number) {
  const now = Date.now()
  return time - now > (60_000 / bpm) * 4 || now - time < 60_000 / bpm
}

export function Scene({ ...props }: Props) {
  const {
    size: { width, height },
  } = useThree()

  const { beats, bpm } = useGameStore()

  const texBeatRow = useTexture('/beat-row.png', processTexture)
  const texBeatCursor = useTexture('/beat-cursor.png', processTexture)

  const visibleBeats = beats.filter((time) => isInThreshold(time, bpm))

  const meshes = React.useRef<{ [key: number]: THREE.Mesh }>({})

  const shoot = React.useCallback(() => {
    const nearestBeatDelta = visibleBeats.reduce(
      (acc, x) => Math.min(acc, Math.abs(x - Date.now())),
      visibleBeats[0]
    )
    const value: 0 | 1 | 2 = nearestBeatDelta < 100 ? 2 : nearestBeatDelta < 400 ? 1 : 0
    if (value === 0) console.log('Aberrant')
    if (value === 1) console.log('Great!')
    if (value === 2) console.log('Perfect!')
  }, [visibleBeats])

  React.useEffect(() => {
    window.addEventListener('keydown', shoot)
    return () => window.removeEventListener('keydown', shoot)
  }, [shoot])

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
      const cursorPos = -width / 2 + height * 0.25
      const delta = (width * (Number(time) - now)) / 1000
      mesh.position.setX(cursorPos + delta)
    }
  })

  return (
    <>
      <group {...props}>
        {/* Beat row */}
        <mesh position={[0, 0, 0.1]}>
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
            position={[width, 0, 0.2]}
          >
            <planeGeometry args={[height * 0.25, height * 0.25]} />
            <meshBasicMaterial color='#81e4c6' />
          </mesh>
        ))}
        {/* Beat cursor */}
        <mesh position={[-width / 2 + height * 0.25, 0, 0.3]}>
          <planeGeometry args={[height * 0.25, height * 0.25]} />
          <meshBasicMaterial map={texBeatCursor} transparent />
        </mesh>
      </group>
    </>
  )
}
