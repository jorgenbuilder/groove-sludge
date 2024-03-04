import { snareSynth } from '../instruments'

export interface Props {
  handlers: {
    start: () => void
  }
}

export default function TitleScreen(props: Props) {
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
