import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'
import { useGameStore } from '../store'

const verse = (i: number) => [
  { time: `${i}:0:0`, cursor: 2, blank: false },
  { time: `${i}:1:0`, cursor: 2, blank: false },
  { time: `${i}:2:0`, cursor: 2, blank: false },
  { time: `${i + 1}:0:0`, cursor: 1, blank: false },
  { time: `${i + 1}:1:0`, cursor: 1, blank: false },
  { time: `${i + 1}:2:0`, cursor: 1, blank: false },
  { time: `${i + 2}:0:0`, cursor: 1, blank: false },
  { time: `${i + 2}:1:0`, cursor: 1, blank: false },
  { time: `${i + 2}:2:0`, cursor: 1, blank: false },
  { time: `${i + 3}:0:0`, cursor: 2, blank: false },
  { time: `${i + 3}:1:0`, cursor: 2, blank: false },
  { time: `${i + 3}:2:0`, cursor: 2, blank: false },
]

const chorus = (i: number) => [
  { time: `${i}:0:0`, cursor: 3, blank: false },
  { time: `${i}:2:0`, cursor: 2, blank: false },
  { time: `${i + 1}:0:0`, cursor: 1, blank: false },
  { time: `${i + 1}:1:0`, cursor: 1, blank: false },
  { time: `${i + 1}:2:0`, cursor: 1, blank: false },
  { time: `${i + 2}:0:0`, cursor: 2, blank: false },
  { time: `${i + 2}:1:0`, cursor: 2, blank: false },
  { time: `${i + 2}:2:0`, cursor: 2, blank: false },
  { time: `${i + 3}:0:0`, cursor: 3, blank: false },
  { time: `${i + 3}:1:0`, cursor: 3, blank: false },
  { time: `${i + 3}:2:0`, cursor: 3, blank: false },
]

const bridge = (i: number) =>
  Array(4)
    .fill(0)
    .flatMap((_, j) => [
      { time: `${i + j}:0:0`, cursor: 2, blank: false },
      { time: `${i + j}:1:0`, cursor: 2, blank: false },
      { time: `${i + j}:2:0`, cursor: 2, blank: false },
    ])

export class SomedayLevel extends EventTarget {
  private startTime?: number

  static beatNotes: { time: string; blank?: boolean }[] = Array(81)
    .fill(0)
    .map((_, i) => ({ time: `${i}:0:0`, blank: i === 0 }))

  static toneNotes: { time: string; cursor: number; blank?: boolean }[] = [
    { time: '0:0:0', cursor: 2, blank: true },
    { time: '1:0:0', cursor: 2, blank: true },
    { time: '2:0:0', cursor: 2, blank: true },
    { time: '3:0:0', cursor: 2, blank: true },
    { time: '4:0:0', cursor: 2, blank: true },
    ...Array(5)
      .fill(0)
      .flatMap((_, i) => verse(5 + i * 4)),
    ...Array(4)
      .fill(0)
      .flatMap((_, i) => chorus(25 + i * 4)),
    ...bridge(41),
    ...Array(2)
      .fill(0)
      .flatMap((_, i) => verse(53 + i * 4)),
    ...Array(4)
      .fill(0)
      .flatMap((_, i) => chorus(61 + i * 4)),
    ...bridge(77),
  ]
  static monsterSpawns: { time: string }[] = [
    { time: '0:0:0' },
    { time: '4:0:0' },
    ...Array(5)
      .fill(0)
      .flatMap((_, i) => verse(5 + i * 4)),
    ...Array(4)
      .fill(0)
      .flatMap((_, i) => chorus(25 + i * 4)),
    ...bridge(41),
    ...Array(2)
      .fill(0)
      .flatMap((_, i) => verse(53 + i * 4)),
    ...Array(4)
      .fill(0)
      .flatMap((_, i) => chorus(61 + i * 4)),
    ...bridge(77),
  ]

  static beatSound = new Tone.Player('someday-kick-sound.wav').toDestination()

  public backingTrack = new Tone.Player('someday-backing.wav').toDestination()
  public rhythmTrack = new Tone.Player('someday-rhythm.wav').toDestination()
  public beatPart
  public tonePart
  private spawnPart

  private pitchShift = new Tone.PitchShift(0).toDestination()
  private cheby = new Tone.Chebyshev(100).toDestination()

  constructor() {
    super()

    this.beatPart = new Tone.Part((time, value) => {
      Tone.Draw.schedule(() => {
        const i = SomedayLevel.beatNotes.indexOf(value)
        const beats = SomedayLevel.beatNotes.slice(i, i + 12).map((beat, j) => ({
          ...beat,
          index: i + j,
          time: Tone.Time(beat.time).toSeconds() + (this.startTime ?? 0),
        }))
        this.dispatchEvent(
          new CustomEvent<{ time: Time; index: number; blank?: boolean }[]>(
            'beatUpdate',
            {
              detail: beats,
            }
          )
        )
      }, time)
      if (value.blank) return
    }, SomedayLevel.beatNotes)

    this.tonePart = new Tone.Part((time, value) => {
      Tone.Draw.schedule(() => {
        const i = SomedayLevel.toneNotes.indexOf(value)
        const beats = SomedayLevel.toneNotes.slice(i, i + 24).map((beat, j) => ({
          ...beat,
          index: i + j,
          time: Tone.Time(beat.time).toSeconds() + (this.startTime ?? 0),
        }))
        this.dispatchEvent(
          new CustomEvent<{ time: Time; index: number; blank?: boolean }[]>(
            'toneUpdate',
            {
              detail: beats,
            }
          )
        )
      }, time)
      if (value.blank) return
      const cursor = useGameStore.getState().toneCursor
      if (value.cursor === cursor) {
        this.rhythmTrack.disconnect(this.pitchShift)
      } else {
        this.rhythmTrack.connect(this.pitchShift)
        this.pitchShift.pitch = (value.cursor - cursor) * 0.5
      }
      useGameStore.getState().addToneMatch(value.cursor - cursor)
    }, SomedayLevel.toneNotes)

    this.spawnPart = new Tone.Part((time, value) => {
      Tone.Draw.schedule(() => {
        this.dispatchEvent(new CustomEvent('spawnMonster'))
      }, time)
    }, SomedayLevel.monsterSpawns)

    Tone.Transport.on('stop', () => {
      this.beatPart.stop()
      this.tonePart.stop()
      this.spawnPart.stop()
    })
  }

  private scheduleCompletion() {
    if (this.startTime) return
    this.startTime = Tone.now()
    const endTime = this.backingTrack.buffer.duration + this.startTime
    const t = Tone.Transport.scheduleRepeat((time) => {
      if (time > endTime) {
        this.dispatchEvent(new CustomEvent('levelComplete'))
        this.stop()
        this.startTime = undefined
        Tone.Transport.clear(t)
      }
    }, `1:0:0`)
  }

  public start() {
    try {
      this.beatPart.start()
      this.tonePart.start()
      this.spawnPart.start()
      this.backingTrack.start()
      this.rhythmTrack.start()
    } catch {}
    Tone.Transport.start()
    this.scheduleCompletion()
  }

  public distort() {
    this.cheby.wet.value = 1
    this.cheby.wet.linearRampToValueAtTime(0, Tone.now() + 1)

    this.backingTrack.connect(this.cheby)
    this.rhythmTrack.connect(this.cheby)
  }

  public stop() {
    Tone.Transport.stop()
    try {
      this.beatPart.stop()
      this.tonePart.stop()
      this.spawnPart.stop()
      this.backingTrack.stop()
      this.rhythmTrack.stop()
    } catch {}
  }

  public restart() {
    this.start()
  }

  public playBeat() {
    SomedayLevel.beatSound.start()
  }
}
