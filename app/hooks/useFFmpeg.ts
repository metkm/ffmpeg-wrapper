import type { FFmpegProgress } from '~/types/ffmpeg'
import { useCommand } from './useCommand'
import { getCurrentWindow, ProgressBarStatus } from '@tauri-apps/api/window'

const regex = /(?<name>\w+)=\s*(?<value>.*?)\s/gm

export const useFFmpeg = (duration: MaybeRefOrGetter<number>) => {
  const progress = ref<FFmpegProgress>({})

  const onLine = (line: string) => {
    const matches = line.matchAll(regex)

    for (const match of matches) {
      if (!match.groups)
        continue

      const name = match.groups.name
      const value = match.groups.value

      if (value === 'N/A' || !value)
        continue

      if (name === 'speed') {
        progress.value.speed = parseFloat(value?.slice(0, -1) || '1')
      } else if (name === 'time') {
        const seconds = formatTimeToSeconds(value)
        const durationLeft = toValue(duration) - seconds

        progress.value.eta = durationLeft / (progress.value.speed || 1)
        progress.value.percent = seconds / toValue(duration) * 100

        getCurrentWindow().setProgressBar({
          status: ProgressBarStatus.Normal,
          progress: Math.round(progress.value.percent),
        })
      }
    }
  }

  const onClose = () => {
    getCurrentWindow().setProgressBar({
      status: ProgressBarStatus.None,
    })
  }

  const command = useCommand({
    onLine,
    onClose,
  })

  return {
    ...command,
    progress,
  }
}
