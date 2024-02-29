import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ACESFilmicToneMapping, sRGBEncoding } from 'three'
import { Scene } from './BeatGame'
import './styles/main.css'
import { OrthographicCamera } from '@react-three/drei'
import { Perf } from 'r3f-perf'

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
      <Canvas
        eventSource={document.getElementById('main')!}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputEncoding: sRGBEncoding,
        }}
        shadows
      >
        {performance && <Perf position='top-left' />}
        <color attach='background' args={['#021912']} />
        <OrthographicCamera
          makeDefault
          args={[-1, 1, 1, -1, 0.1, 2000]}
          position={[0, 0, 1]}
        />
        <Scene position={[0, 0, 0]} />
      </Canvas>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
