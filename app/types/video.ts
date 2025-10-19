export interface Video {
  currentTime: number
  volume: number
  duration?: number
  width?: number
  height?: number
}

export interface VideoInfo {
  fps?: string
  resolution?: string
  videoCodec?: string
  audioCodec?: string
  audioQuality?: string
  creationTime?: string
}
