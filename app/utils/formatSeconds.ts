export const formatSeconds = (n: number) => {
  let totalSeconds = n

  const hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatTimeToSeconds = (time: string) => {
  const [hours, minutes, seconds] = time.slice(0, -3).split(':')
  let totalSeconds = 0

  if (hours) {
    totalSeconds += parseInt(hours) * 3600
  }

  if (minutes) {
    totalSeconds += parseInt(minutes) * 60
  }

  if (seconds) {
    totalSeconds += parseInt(seconds)
  }

  return totalSeconds
}
