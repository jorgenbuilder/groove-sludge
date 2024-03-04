import React from 'react'
import LevelOne from '../levels/one'
import { useGameStore } from '../store'
import { BeatGame } from './BeatGame'
import Scoreboard from './Scoreboard'

export default function FirstLevel() {
  const { shots, resetShots } = useGameStore()
  const [levelComplete, setLevelComplete] = React.useState(false)
  React.useEffect(() => {
    function showScore() {
      setLevelComplete(true)
    }
    LevelOne.addEventListener('levelComplete', showScore)
    return () => LevelOne.removeEventListener('levelComplete', showScore)
  }, [shots])
  return (
    <>
      {levelComplete ? (
        <Scoreboard
          shots={shots}
          handlers={{
            tryAgain() {
              resetShots()
              setLevelComplete(false)
              LevelOne.restart()
            },
            continue() {},
          }}
        />
      ) : (
        <BeatGame level={LevelOne} />
      )}
    </>
  )
}
