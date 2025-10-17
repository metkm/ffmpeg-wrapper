export interface Video {
  duration: number
  currentTime: number
  durationRange: [number, number]
  crop: {
    width: number
    height: number
    left: number
    top: number
  }
  volume: number
}

export interface VideoInfo {
  fps?: string
  resolution?: string
  videoCodec?: string
  audioCodec?: string
  audioQuality?: string
  creationTime?: string
}
