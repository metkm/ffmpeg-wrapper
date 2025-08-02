export interface Video {
  duration: number
  currentTime: number
  range: [number, number]
  crop: {
    width: number
    height: number
    left: number
    top: number
  }
}
