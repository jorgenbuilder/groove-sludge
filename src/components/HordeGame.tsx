import * as THREE from 'three'
import * as Tone from 'tone'
import { GroupProps, MeshProps, useFrame, useThree } from '@react-three/fiber'
import { useDimensions } from '../util'
import { create } from 'zustand'
import React from 'react'
import { useAtom } from 'jotai'
import { keyboardStateAtom } from '../systems/keyboard-input'

interface Props extends GroupProps {}

const usePlayerStore = create<{
  x: number
  y: number
  speed: number
  move: (x: number, y: number) => void
}>()((set, get) => ({
  x: 0,
  y: 0,
  speed: 1,
  move(x, y) {
    set({ x: get().x + x, y: get().y + y })
  },
}))

function Player({ ...props }: MeshProps) {
  const [keyboard] = useAtom(keyboardStateAtom)
  const ref = React.useRef<THREE.Mesh>(null)
  const { width } = useDimensions()
  const speed = 100

  useFrame((_, dt) => {
    const { move } = usePlayerStore.getState()
    let [moveX, moveY] = [0, 0]
    if (keyboard.isDown.w) moveY += 1
    if (keyboard.isDown.s) moveY -= 1
    if (keyboard.isDown.a) moveX -= 1
    if (keyboard.isDown.d) moveX += 1
    move(moveX * dt * speed, moveY * dt * speed)
    if (!ref.current) return
    const { x, y } = usePlayerStore.getState()
    ref.current.position.set(x, y, ref.current.position.z)
  })

  return (
    <mesh ref={ref} position={[0, 0, 5]} {...props}>
      <planeGeometry args={[width(5), width(5)]} />
      <meshBasicMaterial color='white' />
    </mesh>
  )
}

export const useMonsterStore = create<{
  monsters: { id: number }[]
  monsterPositions: { id: number; x: number; y: number }[]
  spawn: (count: number) => void
  march: (distance: number) => void
}>()((set, get) => ({
  monsters: [],
  monsterPositions: [],
  spawn(count) {
    for (let i = 0; i < count; i++) {
      const id = get().monsters.length
      const x = Math.random() * 800 - 400
      const y = Math.random() * 400 - 200

      set({
        monsters: [...get().monsters, { id }],
        monsterPositions: [...get().monsterPositions, { id, x, y }],
      })
    }
  },
  march(distance) {
    const destination = usePlayerStore.getState()
    set({
      monsterPositions: get().monsterPositions.map(({ x, y, ...rest }) => ({
        ...rest,
        x: THREE.MathUtils.lerp(x, destination.x, distance),
        y: THREE.MathUtils.lerp(y, destination.y, distance),
      })),
    })
  },
}))

function Monsters({ ...props }: GroupProps) {
  const { spawn, monsters } = useMonsterStore(({ monsters, spawn }) => ({
    monsters,
    spawn,
  }))
  React.useEffect(() => {
    if (monsters.length > 0) return
    spawn(5)
  }, [])
  useFrame((_, dt) => {
    useMonsterStore.getState().march(dt)
  })
  return (
    <group {...props}>
      {monsters.map(({ id }) => (
        <Monster key={`monster-${id}`} id={id} />
      ))}
    </group>
  )
}

function Monster({ id, ...props }: MeshProps & { id: number }) {
  const ref = React.useRef<THREE.Mesh>(null)
  const { width } = useDimensions()
  const speed = 100
  useFrame(() => {
    if (!ref.current) return
    const { x, y } = useMonsterStore.getState().monsterPositions[id]
    ref.current.position.x = x
    ref.current.position.y = y
    if (x > width(256 * 0.64) / 2 || y < -width(144 * 0.75) / 2)
      ref.current.visible = false
    else ref.current.visible = true
  })
  return (
    <mesh ref={ref} position={[0, 0, 5]} {...props}>
      <circleGeometry args={[width(2.5), 25]} />
      <meshBasicMaterial color='red' />
    </mesh>
  )
}

export default function ({ ...props }: Props) {
  const { height, width } = useDimensions()
  return (
    <group {...props}>
      <Player />
      <Monsters />
      {/* Backdrop */}
      <mesh>
        <planeGeometry args={[width(256 * 0.66), height(144 * 0.75)]} />
        <meshBasicMaterial color='black' />
      </mesh>
    </group>
  )
}
