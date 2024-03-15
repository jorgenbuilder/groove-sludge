import { useThree } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'

export function useDimensions() {
  const {
    size: { width, height },
  } = useThree()

  const [fw, fh] = [width / 256, height / 144]

  const [d, setD] = React.useState({
    width(w: number) {
      return w * fw
    },
    height(h: number) {
      return h * fh
    },
  })

  React.useEffect(() => {
    setD({
      width(w: number) {
        return w * fw
      },
      height(h: number) {
        return h * fh
      },
    })
  }, [width, height])

  return d
}

export function processTexture(tex: THREE.Texture) {
  tex.generateMipmaps = false
  tex.magFilter = THREE.NearestFilter
}

export function isInThreshold(time: number, bpm: number) {
  const now = Date.now()
  return time - now > (60_000 / bpm) * 4 || now - time < 60_000 / bpm
}

/// Remap a tone granulatity (1-n) to -0.5 through 0.5
export function normalizeTone(tone: number, granularity: number) {
  return 0.5 - (tone - 1) / (granularity - 1)
}
