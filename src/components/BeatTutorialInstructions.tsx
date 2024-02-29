import { GroupProps } from '@react-three/fiber'
import { processTexture, useDimensions } from '../util'
import { useTexture } from '@react-three/drei'

export interface Props extends GroupProps {
  count: number
}

export default function BeatTutorialInstructions({ count, ...props }: Props) {
  const { width, height } = useDimensions()
  const tex0 = useTexture('/beat-tut-0.png', processTexture)
  const tex1 = useTexture('/beat-tut-1.png', processTexture)
  const tex2 = useTexture('/beat-tut-2.png', processTexture)
  const tex3 = useTexture('/beat-tut-3.png', processTexture)
  const tex4 = useTexture('/beat-tut-4.png', processTexture)
  const tex = [tex0, tex1, tex2, tex3, tex4][count]
  return (
    <group {...props}>
      <mesh>
        <planeGeometry args={[width(99), height(7)]} />
        <meshBasicMaterial transparent map={tex} />
      </mesh>
    </group>
  )
}
