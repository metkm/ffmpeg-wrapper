// export interface Video {
//   duration: number
//   currentTime: number
//   durationRange: [number, number]
//   // crop: Crop
//   volume: number
// }

// export interface Crop {
//   width: number
//   height: number
//   left: number
//   top: number
// }

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
