import type { FFmpegProgress } from '~/types/ffmpeg'
import { useCommand } from './useCommand'
import { getCurrentWindow, ProgressBarStatus } from '@tauri-apps/api/window'
import { animate } from 'motion-v'

const regex = /(time=(?<time>\d+:\d+:\d+)).*(speed=(?<speed>\d+.\d+x))/

export const useFFmpeg = (duration?: MaybeRefOrGetter<number>) => {
  const progress = ref<FFmpegProgress>({})

  const _etaAnimated = useMotionValue(0)
  const etaAnimated = useTransform(() => Math.round(_etaAnimated.get()))

  // example
  // frame=   84 fps= 81 q=162.0 size=     256KiB time=00:00:01.40 bitrate=1498.2kbits/s speed=1.35x elapsed=0:00:01.03
  const onLine = (line: string) => {
    const match = line.match(regex)
    if (!match || !match.groups)
      return

    if (match.groups['speed']) {
      progress.value.speed = parseFloat(match.groups['speed'])
    }

    if (match.groups['time'] && duration) {
      const seconds = formatTimeToSeconds(match.groups['time'])
      const durationLeft = toValue(duration) - seconds

      const eta = durationLeft / (progress.value.speed || 1)

      animate(_etaAnimated, eta, {
        from: progress.value.eta || 0,
        ease: 'easeInOut',
      })

      progress.value.eta = eta
      progress.value.percent = seconds / toValue(duration) * 100

      getCurrentWindow().setProgressBar({
        status: ProgressBarStatus.Normal,
        progress: Math.round(progress.value.percent),
      })
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
    etaAnimated,
  }
}
