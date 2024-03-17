import * as THREE from 'three'
import { GroupProps, MeshProps, useFrame } from '@react-three/fiber'
import { useDimensions } from '../util'
import { create } from 'zustand'
import React, { useEffect } from 'react'
import { useAtom } from 'jotai'
import { keyboardStateAtom } from '../systems/keyboard-input'
import { SomedayLevel } from '../levels/someday'

interface Props extends GroupProps {
  stop: () => void
  onHit: () => void
  level: SomedayLevel
}

const usePlayerStore = create<{
  x: number
  y: number
  speed: number
  hp: number
  move: (x: number, y: number) => void
  bounds: { x: [number, number]; y: [number, number] }
  setBounds: (bounds: { x: [number, number]; y: [number, number] }) => void
}>()((set, get) => ({
  x: 0,
  y: 0,
  hp: 100,
  speed: 1,
  move(x, y) {
    const { bounds } = get()

    set({
      x: THREE.MathUtils.clamp(get().x + x, bounds.x[0], bounds.x[1]),
      y: THREE.MathUtils.clamp(get().y + y, bounds.y[0], bounds.y[1]),
    })
  },
  bounds: { x: [0, 0] as const, y: [0, 0] as const },
  setBounds(bounds) {
    set({ bounds })
  },
}))

const pos1 = new THREE.Vector2(0, 0)
const pos2 = pos1.clone()

function Player({ onHit, ...props }: MeshProps & { onHit: () => void }) {
  const [keyboard] = useAtom(keyboardStateAtom)
  const ref = React.useRef<THREE.Mesh>(null)
  const { width } = useDimensions()
  const speed = 50

  useFrame((_, dt) => {
    const { move } = usePlayerStore.getState()
    const { monsterPositions } = useMonsterStore.getState()
    let [moveX, moveY] = [0, 0]
    if (keyboard.isDown.w) moveY += 1
    if (keyboard.isDown.s) moveY -= 1
    if (keyboard.isDown.a) moveX -= 1
    if (keyboard.isDown.d) moveX += 1
    move(width(moveX * dt * speed), width(moveY * dt * speed))
    if (!ref.current) return
    const { x, y } = usePlayerStore.getState()
    ref.current.position.set(x, y, ref.current.position.z)

    // Remove hp on contact
    pos1.x = x
    pos1.y = y
    for (const monster of monsterPositions) {
      pos2.x = monster.x
      pos2.y = monster.y
      if (pos1.distanceTo(pos2) < width(7.5)) {
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

function randomPerimeterPosition() {
  const { bounds } = usePlayerStore.getState()
  const side = Math.floor(Math.random() * 4) // 0 = top; 1 = right; 2 = bottom; 3 = left;
  let x = 0
  let y = 0
  // Left/right side...
  if (side % 2 === 1) {
    x = side === 1 ? bounds.x[1] : bounds.x[0]
    y = THREE.MathUtils.randFloat(bounds.y[0] * 1.25, bounds.y[1] * 1.25)
  } else {
    // Top/bottom side...
    x = THREE.MathUtils.randFloat(bounds.x[0] * 1.25, bounds.x[1] * 1.25)
    y = side === 1 ? bounds.x[1] : bounds.x[0]
  }
  return [x, y, side]
}

export const useMonsterStore = create<{
  i: number
  incrementI: () => number
  monsters: { id: number; despawn?: boolean }[]
  monsterPositions: {
    id: number
    x: number
    y: number
    destinationX: number
    destinationY: number
    despawn?: boolean
  }[]
  spawn: (count: number) => void
  march: (distance: number) => void
}>()((set, get) => ({
  i: 0,
  incrementI: () => {
    set(({ i }) => ({ i: i + 1 }))
    return get().i - 1
  },
  monsters: [],
  monsterPositions: [],
  spawn(count) {
    const player = usePlayerStore.getState()
    for (let i = 0; i < count; i++) {
      const [x, y, side] = randomPerimeterPosition()
      const destinationX = -x + (side % 2 === 0 ? player.x * 2 : 0)
      const destinationY = -y + (side % 2 === 1 ? player.y * 2 : 0)
      const id = get().incrementI()

      set({
        monsters: [...get().monsters, { id }],
        monsterPositions: [
          ...get().monsterPositions,
          { id, x, y, destinationX, destinationY },
        ],
      })
    }
  },
  march(distance) {
    const player = usePlayerStore.getState()
    const destinationPosition = new THREE.Vector3(0, 0, 0)
    const currentPosition = new THREE.Vector3(0, 0, 0)
    const direction = new THREE.Vector3(0, 0, 0)

    set(({ monsterPositions, monsters }) => {
      const update = monsterPositions.map(
        ({ x, y, destinationX, destinationY, ...rest }) => {
          destinationPosition.set(destinationX, destinationY, 0)
          currentPosition.x = x
          currentPosition.y = y
          direction.subVectors(destinationPosition, currentPosition)
          // console.log(currentPosition.distanceTo(destinationPosition))
          return {
            ...rest,
            x: x + direction.normalize().x,
            y: y + direction.normalize().y,
            destinationX,
            destinationY,
            despawn: currentPosition.distanceTo(destinationPosition) < 5,
          }
        }
      )
      const despawn = update.reduce<{ [key: number]: boolean }>(
        (agg, x) => ({
          ...agg,
          [x.id]: !!x.despawn,
        }),
        {}
      )
      return {
        monsterPositions: update,
        monsters: monsters.map((r) => ({ ...r, despawn: despawn[r.id] })),
      }
    })
  },
}))

function Monsters({ ...props }: GroupProps) {
  const { spawn, monsters } = useMonsterStore(({ monsters, spawn }) => ({
    monsters,
    spawn,
  }))
  useFrame((_, dt) => {
    useMonsterStore.getState().march(dt)
  })
  return (
    <group {...props}>
      {monsters
        .filter(({ despawn }) => !despawn)
        .map(({ id }) => (
          <Monster key={`monster-${id}`} id={id} />
        ))}
    </group>
  )
}

function Monster({ id, ...props }: MeshProps & { id: number }) {
  const ref = React.useRef<THREE.Mesh>(null)
  const { width } = useDimensions()
  const speed = 100
  const monsters = useMonsterStore(({ monsters }) => monsters)
  useFrame(() => {
    if (!ref.current) return
    const { monsterPositions } = useMonsterStore.getState()
    if (!monsterPositions[id]) return
    const { x, y } = monsterPositions[id]
    ref.current.position.x = x
    ref.current.position.y = y
    if (x > width(256 * 0.64) / 2 || y < -width(144 * 0.75) / 2)
      ref.current.visible = false
    else ref.current.visible = true
  })
  if (!monsters[id]) return null
  return (
    <mesh ref={ref} position={[0, 0, 5]} {...props}>
      <circleGeometry args={[width(2.5), 25]} />
      <meshBasicMaterial color='red' />
    </mesh>
  )
}

export default function ({ onHit, level, ...props }: Props) {
  const { height, width } = useDimensions()
  const { hp, setBounds } = usePlayerStore(({ hp, setBounds }) => ({ hp, setBounds }))
  const spawn = useMonsterStore(({ spawn }) => spawn)

  React.useEffect(() => {
    setBounds({
      x: [width(256 * 0.66 - 5) / -2, width(256 * 0.66 - 5) / 2],
      y: [height(144 * 0.75 - 5) / -2, height(144 * 0.75 - 5) / 2],
    })
  }, [height, width])

  React.useEffect(() => {
    function spawnMonster() {
      spawn(1)
    }
    level.addEventListener('spawnMonster', spawnMonster)
    return () => level.removeEventListener('spawnMonster', spawnMonster)
  }, [spawn])

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
