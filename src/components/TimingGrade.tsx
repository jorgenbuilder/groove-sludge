import { useTexture } from '@react-three/drei'
import { GroupProps, MeshProps, useFrame, useThree } from '@react-three/fiber'
import { useSpring, a } from '@react-spring/three'
import React from 'react'
import { processTexture } from '../util'

export interface Props extends GroupProps {
  grade: 0 | 1 | 2
}

export default function TimingGrade({ grade, ...props }: Props) {
  const texAbberant = useTexture('/abberant.png', processTexture)
  const texGreat = useTexture('/great.png', processTexture)
  const texPerfect = useTexture('/perfect.png', processTexture)

  const [spring] = useSpring(() => ({
    from: {
      scale: 0,
      position: [0, 0, 0],
      opacity: 1,
    },
    to: {
      scale: 1,
      position: [0, 2, 0],
      opacity: 0,
    },
    config(key) {
      switch (key) {
        case 'scale':
          return { mass: 1, tension: 75, friction: 5 }
        default:
          return { mass: 4, tension: 32 }
      }
    },
  }))

  const {
    size: { width, height },
  } = useThree()

  const [fw, fh] = [width / 256, height / 144]

  const mesh = React.useRef<THREE.Mesh>(null)

  return (
    <group {...props}>
      <a.mesh
        ref={mesh}
        scale={spring.scale}
        position={spring.position.to((x, y, z) => [x, y, z])}
      >
        <planeGeometry args={[40 * fw, 9 * fh]} />
        <a.meshBasicMaterial
          map={grade === 0 ? texAbberant : grade === 1 ? texGreat : texPerfect}
          transparent
          opacity={spring.opacity.to((x) => x)}
        />
      </a.mesh>
    </group>
  )
}
