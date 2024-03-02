import { useThree } from '@react-three/fiber'
import { useDimensions } from '../util'
import { BeatGame } from './BeatGame'
import ToneGame from './ToneGame'

export default function FullGame() {
  const {
    size: { width, height },
  } = useThree()
  return (
    <>
      <ToneGame position={[width * (0.5 - 0.34 / 2), height * (0.5 - 0.75 / 2), 0]} />
      <BeatGame position={[0, -height * (0.5 - 0.125), 0]} />
    </>
  )
}
