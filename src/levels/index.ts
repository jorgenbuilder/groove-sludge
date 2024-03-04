import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'

export class Level<T> extends EventTarget {
  public beatNotes
  public beatInstrument
  public track

  public beatPart: Tone.Part
  public playBeat: () => void

  private startTime?: number

  constructor(args: {
    beatNotes: { time: string; blank?: boolean }[]
    beatInstrument: T
    track: Tone.Player
    playBeat: () => void
  }) {
    super()
    this.beatNotes = args.beatNotes
    this.beatInstrument = args.beatInstrument
    this.track = args.track
    this.track.loop = false
    this.track.volume.value = -5
    this.playBeat = args.playBeat

    this.beatPart = new Tone.Part((time, value) => {
      Tone.Draw.schedule(() => {
        const i = args.beatNotes.indexOf(value)
        const beats = args.beatNotes.slice(i, i + 12).map((beat, j) => ({
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
    }, args.beatNotes)

    Tone.Transport.on('stop', () => {
      this.beatPart.stop()
    })
  }

  private scheduleCompletion() {
    if (this.startTime) return
    this.startTime = Tone.now()
    const endTime = this.track.buffer.duration + this.startTime
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
      this.track.start()
    } catch {}
    Tone.Transport.start()
    this.scheduleCompletion()
  }

  public stop() {
    Tone.Transport.stop()
  }

  public restart() {
    this.start()
  }
}
