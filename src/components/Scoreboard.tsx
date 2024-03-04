import { Html } from '@react-three/drei'

export interface Props {
  shots: [number, 0 | 1 | 2][]
  handlers: {
    tryAgain: () => void
    continue: () => void
  }
}

export default function Scoreboard({ shots, handlers, ...props }: Props) {
  const score = shots.reduce<{ [key: number]: number }>((acc, [, v]) => {
    return { ...acc, [v]: (acc[v] ?? 0) + 1 }
  }, {})
  return (
    <Html style={{ width: '400px' }}>
      <div {...props}>
        <div>Aberrant: {score[0] ?? 0} × -100</div>
        <div>Great: {score[1] ?? 0} × 100</div>
        <div>Perfect: {score[2] ?? 0} × 200</div>
        <div>
          <strong>
            Total:{' '}
            {(score[0] ?? 0) * -100 + (score[1] ?? 0) * 100 + (score[2] ?? 0) * 200}
          </strong>
        </div>
        <button onClick={handlers.continue}>Continue</button>
        <button onClick={handlers.tryAgain}>Try Again</button>
      </div>
    </Html>
  )
}
