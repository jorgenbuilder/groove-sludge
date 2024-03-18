import { Html, useTexture } from '@react-three/drei'
import { snareSynth } from '../instruments'
import { processTexture, useDimensions } from '../util'
import { SpriteAnimator } from './SpriteAnimator'

export interface Props {
  handlers: {
    start: () => void
  }
}

export default function TitleScreen(props: Props) {
  const { width, height } = useDimensions()
  const start = useTexture('./start.png', processTexture)
  return (
    <group>
      <SpriteAnimator
        textureDataURL='./title.json'
        textureImageURL='./title.png'
        autoPlay
        loop
        planeArgs={[width(256), height(144)]}
        fps={3}
      />
      <mesh
        position={[0, -height(144 * 0.125), 1]}
        onClick={() => {
          props.handlers.start()
          snareSynth.triggerAttackRelease('8n')
        }}
      >
        <planeGeometry args={[width(42), width(7)]} />
        <meshBasicMaterial map={start} transparent />
      </mesh>
    </group>
  )
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1>Groove Sludge Game Concept</h1>
      <button
        onClick={() => {
          props.handlers.start()
          snareSynth.triggerAttackRelease('8n')
        }}
      >
        Start
      </button>
    </div>
  )
}
