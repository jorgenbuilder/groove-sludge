import * as THREE from 'three'
import * as Tone from 'tone'
import { GroupProps, MeshProps, useFrame } from '@react-three/fiber'
import { useDimensions } from '../util'
import { create } from 'zustand'
import React, { useEffect } from 'react'
import { useAtom } from 'jotai'
import { keyboardStateAtom } from '../systems/keyboard-input'

interface Props extends GroupProps {
  stop: () => void
  onHit: () => void
}

const usePlayerStore = create<{
  x: number
  y: number
  speed: number
  hp: number
  move: (x: number, y: number) => void
}>()((set, get) => ({
  x: 0,
  y: 0,
  hp: 100,
  speed: 1,
  move(x, y) {
    set({ x: get().x + x, y: get().y + y })
  },
}))

const pos1 = new THREE.Vector2(0, 0)
const pos2 = pos1.clone()

function Player({ onHit, ...props }: MeshProps & { onHit: () => void }) {
  const [keyboard] = useAtom(keyboardStateAtom)
  const ref = React.useRef<THREE.Mesh>(null)
  const { width } = useDimensions()
  const speed = 100

  useFrame((_, dt) => {
    const { move } = usePlayerStore.getState()
    const { monsterPositions } = useMonsterStore.getState()
    let [moveX, moveY] = [0, 0]
    if (keyboard.isDown.w) moveY += 1
    if (keyboard.isDown.s) moveY -= 1
    if (keyboard.isDown.a) moveX -= 1
    if (keyboard.isDown.d) moveX += 1
    move(moveX * dt * speed, moveY * dt * speed)
    if (!ref.current) return
    const { x, y } = usePlayerStore.getState()
    ref.current.position.set(x, y, ref.current.position.z)

    // Remove hp on contact
    pos1.x = x
    pos1.y = y
    for (const monster of monsterPositions) {
      pos2.x = monster.x
      pos2.y = monster.y
      if (pos1.distanceTo(pos2) < 25) {
        onHit()
        usePlayerStore.setState(({ hp }) => ({ hp: Math.max(hp - 10 * dt, 0) }))
      }
    }
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
    const player = usePlayerStore.getState()
    const destinationPosition = new THREE.Vector3(player.x, player.y, 0)
    const currentPosition = new THREE.Vector3(0, 0, 0)
    const direction = new THREE.Vector3(0, 0, 0)

    set(({ monsterPositions }) => {
      const update = monsterPositions.map(({ x, y, ...rest }) => {
        currentPosition.x = x
        currentPosition.y = y
        direction.subVectors(destinationPosition, currentPosition)
        return {
          ...rest,
          x: x + direction.normalize().x,
          y: y + direction.normalize().y,
        }
      })
      return {
        monsterPositions: update,
      }
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

export default function ({ onHit, ...props }: Props) {
  const { height, width } = useDimensions()
  const { hp } = usePlayerStore(({ hp }) => ({ hp }))

  useEffect(() => {
    if (hp <= 0) props.stop()
  }, [hp])
  return (
    <group {...props}>
      <Player onHit={onHit} />
      <Monsters />
      {/* Backdrop */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width(256 * 0.66), height(144 * 0.75)]} />
        <meshBasicMaterial color='black' />
      </mesh>
      <group position={[-width((256 * 0.64) / 2 - 25), width((144 * 0.75) / 2 - 5), 10]}>
        <mesh position={[0, 0, 10]}>
          <planeGeometry args={[width(50), width(5)]} />
          <meshBasicMaterial color='darkred' />
        </mesh>
        <mesh scale={[hp / 100, 1, 1]} position={[0, 0, 10]}>
          <planeGeometry args={[width(Math.max(0, (50 * hp) / 100)), width(5)]} />
          <meshBasicMaterial color='white' />
        </mesh>
      </group>
    </group>
  )
}
