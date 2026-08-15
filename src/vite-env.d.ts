/// <reference types="vite/client" />

declare module 'react-force-graph-2d' {
  import type { ComponentType } from 'react'
  const ForceGraph2D: ComponentType<Record<string, unknown>>
  export default ForceGraph2D
}

declare module 'react-force-graph-3d' {
  import type { ComponentType } from 'react'
  const ForceGraph3D: ComponentType<Record<string, unknown>>
  export default ForceGraph3D
}

declare module 'three/examples/jsm/postprocessing/AfterimagePass.js' {
  export class AfterimagePass {
    constructor(damp?: number)
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import type { Vector2 } from 'three'
  export class UnrealBloomPass {
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number)
  }
}

declare module 'three-spritetext' {
  import type { Sprite } from 'three'
  export default class SpriteText extends Sprite {
    constructor(text?: string, textHeight?: number, color?: string)
    text: string
    textHeight: number
    color: string
    fontFace: string
    fontWeight: string
    fontSize: number
    backgroundColor: false | string
    padding: number
    borderRadius: number
    borderWidth: number
    borderColor: string
    strokeWidth: number
    strokeColor: string
  }
}
