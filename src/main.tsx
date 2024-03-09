import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.css'
import { OrthographicCamera } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import BeatTutorialLevel from './components/LevelOne'
import ToneGame from './components/ToneGame'
import FullGame from './components/FullGame'
import TitleScreen from './components/TitleScreen'
import { BeatGame } from './components/BeatGame'
import LevelOne from './levels/one'
import FirstLevel from './components/LevelOne'

function Main() {
  const { performance } = useControls(
    'Monitoring',
    {
      performance: false,
    },
    {
      collapsed: true,
    }
  )

  const [started, setStarted] = React.useState(false)

  return (
    <div className='main'>
      <Leva
        collapsed={false}
        oneLineLabels={false}
        flat={true}
        theme={{
          sizes: {
            titleBarHeight: '28px',
          },
          fontSizes: {
            root: '10px',
          },
        }}
      />
      {!started && <TitleScreen handlers={{ start: () => setStarted(true) }} />}
      {started && (
        <Canvas>
          {performance && <Perf position='top-left' />}
          <color attach='background' args={['#021912']} />
          <OrthographicCamera
            makeDefault
            args={[-1, 1, 1, -1, 0.1, 2000]}
            position={[0, 0, 100]}
          />
          <FullGame />
        </Canvas>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
