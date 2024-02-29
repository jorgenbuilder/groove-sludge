import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function useDimensions() {
  const {
    size: { width, height },
  } = useThree()

  const [fw, fh] = [width / 256, height / 144]

  return {
    width(w: number) {
      return w * fw
    },
    height(h: number) {
      return h * fh
    },
  }
}

export function processTexture(tex: THREE.Texture) {
  tex.generateMipmaps = false
  tex.magFilter = THREE.NearestFilter
}

export function isInThreshold(time: number, bpm: number) {
  const now = Date.now()
  return time - now > (60_000 / bpm) * 4 || now - time < 60_000 / bpm
}
