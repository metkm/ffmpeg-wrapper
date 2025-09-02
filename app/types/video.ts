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
