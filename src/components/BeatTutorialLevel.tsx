import { useGameStore } from '../store'
import { BeatGame } from './BeatGame'
import BeatTutorialInstructions from './BeatTutorialInstructions'
import Metronome from './Metronome'

export default function BeatTutorialLevel() {
  const { shots } = useGameStore()
  const shotsInARow = (() => {
    let result = 0
    const reversed = shots.toReversed()
    for (const [, grade] of reversed) {
      if (grade > 0) {
        result++
      } else {
        break
      }
    }
    return result
  })()
  return (
    <>
      <Metronome />
      <BeatTutorialInstructions count={shotsInARow} position={[0, 150, 0]} />
      <BeatGame />
    </>
  )
}
