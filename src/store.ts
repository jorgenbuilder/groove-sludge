import * as Tone from 'tone'
import * as THREE from 'three'
import { create } from 'zustand'
import { normalizeTone } from './util'

const bpm = 106
Tone.Transport.bpm.value = bpm

interface GameStore {
  bpm: number
  setBpm: (bpm: number) => void
  shots: [number, 0 | 1 | 2][]
  addShot: (shot: [number, 0 | 1 | 2]) => void
  toneMatches: number[]
  addToneMatch: (tone: number) => void
  resetShots: () => void
  toneGranularity: number
  toneCursor: number
  toneCursorNormalized: number
  moveCursorUp: () => void
  moveCursorDown: () => void
  currTone?: string
  setCurrTone: (tone: string) => void
}

const toneGranularity = 3

export const useGameStore = create<GameStore>()((set, get) => ({
  bpm,
  setBpm: (bpm) => {
    set({ bpm })
    Tone.Transport.bpm.value = bpm
  },
  shots: [],
  addShot: (shot) => {
    set((prev) => ({ shots: [...prev.shots, shot] }))
  },
  toneMatches: [],
  addToneMatch: (tone) => {
    set((prev) => ({ toneMatches: [...prev.toneMatches, tone] }))
  },
  resetShots: () => set({ shots: [] }),
  toneGranularity,
  toneCursor: Math.ceil(toneGranularity / 2),
  toneCursorNormalized: normalizeTone(Math.ceil(toneGranularity / 2), toneGranularity),
  moveCursorUp() {
    const { toneCursor, toneGranularity } = get()
    const update = THREE.MathUtils.clamp(toneCursor + 1, 1, toneGranularity)
    const normalized = normalizeTone(update, toneGranularity)
    set((prev) => ({
      ...prev,
      toneCursor: update,
      toneCursorNormalized: normalized,
    }))
  },
  moveCursorDown() {
    const { toneCursor, toneGranularity } = get()
    const update = THREE.MathUtils.clamp(toneCursor - 1, 1, toneGranularity)
    const normalized = normalizeTone(update, toneGranularity)
    set((prev) => ({
      ...prev,
      toneCursor: update,
      toneCursorNormalized: normalized,
    }))
  },
  setCurrTone(currTone) {
    set({ currTone })
  },
}))
