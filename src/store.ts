import { create } from 'zustand'

const bpm = 114

interface GameStore {
  bpm: number
  beats: number[]
  addBeat: (beat: number) => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  bpm,
  beats: [],
  addBeat: (beat) => {
    set((prev) => ({ beats: [...prev.beats, beat] }))
  },
}))

// Mock up some... beats
setInterval(() => {
  useGameStore.getState().addBeat(Date.now() + (60_000 / bpm) * 2)
}, (60_000 / bpm) * 2)
