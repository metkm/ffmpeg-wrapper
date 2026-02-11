export interface VideoCropOptions {
  top: number
  left: number
  width?: number
  height?: number
}

export interface VideoTrimOptions {
  start: number
  end?: number
}

export interface Video {
  currentTime: number
  volume: number
  duration?: number
  width?: number
  height?: number
  ratio: number
}

export interface VideoInfo {
  codec?: string
  decoder?: string
  resolution?: `${number}x${number}`
  fps?: number
  bitrate?: string
  ratio?: number
}
