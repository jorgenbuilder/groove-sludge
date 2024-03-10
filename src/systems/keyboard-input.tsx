import React from 'react'
import { useAtom } from 'jotai'
import { atom } from 'jotai'
import { useFrame } from '@react-three/fiber'

export interface KeyboardState {
  pressed: {
    [key: string]: boolean
  }
  isDown: {
    [key: string]: boolean
  }
  mouse: {
    pointer: { x: number; y: number }
    isMoving: boolean
  }
}

export const keyboardStateAtom = atom<KeyboardState>({
  pressed: {},
  isDown: {},
  mouse: {
    pointer: { x: 0, y: 0 },
    isMoving: false,
  },
})

const KeyboardControlSystem = () => {
  const [keyboard, setKeyboardState] = useAtom(keyboardStateAtom)

  React.useEffect(() => {
    const handleKeyDown = ({ key }: { key: string }) => {
      const normalizedKey = key.toLowerCase()
      setKeyboardState((prev) => {
        const update = structuredClone(prev)
        update.isDown[normalizedKey] = true
        update.pressed[normalizedKey] = true
        return update
      })
    }

    const handleKeyUp = ({ key }: { key: string }) => {
      const normalizedKey = key.toLowerCase()
      setKeyboardState((prev) => {
        const update = structuredClone(prev)
        delete update.isDown[normalizedKey]
        return update
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setKeyboardState])

  useFrame(({ pointer }) => {
    keyboard.mouse.isMoving =
      keyboard.mouse.pointer.x !== pointer.x || keyboard.mouse.pointer.y !== pointer.y
    keyboard.mouse.pointer.x = pointer.x
    keyboard.mouse.pointer.y = pointer.y

    for (const key in keyboard.pressed) {
      delete keyboard.pressed[key]
    }
  }, -1)

  return null
}

export default KeyboardControlSystem
