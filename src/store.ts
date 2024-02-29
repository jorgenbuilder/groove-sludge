import { create } from 'zustand'

const bpm = 150

interface GameStore {
  bpm: number
  beats: number[]
  addBeat: (beat: number) => void
  shots: [number, 0 | 1 | 2][]
  addShot: (shot: [number, 0 | 1 | 2]) => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  bpm,
  beats: [],
  addBeat: (beat) => {
    set((prev) => ({ beats: [...prev.beats, beat] }))
  },
  shots: [],
  addShot: (shot) => {
    set((prev) => ({ shots: [...prev.shots, shot] }))
  },
}))

// Mock up some... beats
setInterval(() => {
  useGameStore.getState().addBeat(Date.now() + (60_000 / bpm) * 2)
}, (60_000 / bpm) * 4)
