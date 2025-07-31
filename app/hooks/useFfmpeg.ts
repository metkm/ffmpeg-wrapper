import { Command, type Child } from '@tauri-apps/plugin-shell'
import type { FFmpegProgress } from '~/types/ffmpeg'

const regex = /(?<name>\w+)=\s*(?<value>.*?)\s/gm

const parseProgress = (line: string): FFmpegProgress => {
  const progress: FFmpegProgress = {}

  let match: RegExpExecArray | null = null

  while ((match = regex.exec(line)) !== null) {
    if (!match.groups) break

    const { name, value } = match.groups
    if (!name) break

    const key = name as keyof FFmpegProgress
    progress[key] = value as Exclude<undefined, FFmpegProgress[typeof key]>
  }

  return {
    ...progress,
    frame: progress.frame ? parseInt(progress.frame.toString()) : 0,
    fps: progress.fps ? parseInt(progress.fps.toString()) : 0,
    q: progress.q ? parseFloat(progress.q.toString()) : 0,
    speed: progress.speed ? parseFloat(progress.speed?.toString().slice(0, -1)) : 0,
  }
}

export const useFFmpeg = () => {
  const stdoutLines = ref<string[]>([])
  const processing = ref(false)
  const progress = ref<FFmpegProgress>()

  const command = shallowRef<Command<string>>()
  const commandChild = shallowRef<Child>()

  const spawn = async (args: string[], listener?: (arg: string) => void) => {
    kill()

    command.value = Command.sidecar('binaries/ffmpeg', args)

    const onData = (_line: string) => {
      const line = _line.trim()
      stdoutLines.value.push(line)

      listener?.(line)
      progress.value = parseProgress(line)
    }

    command.value.stdout.on('data', onData)
    command.value.stderr.on('data', onData)

    const promise = new Promise<void>(
      (resolve) => {
        command.value?.once('close', () => {
          resolve()
          kill()
        })
      },
    )

    processing.value = true
    commandChild.value = await command.value.spawn()

    await promise
  }

  const kill = () => {
    commandChild.value?.kill()
    command.value?.removeAllListeners()

    command.value = undefined
    commandChild.value = undefined
    processing.value = false
  }

  const clear = () => {
    stdoutLines.value = []
    kill()
  }

  const stop = () => {
    clear()
  }

  onUnmounted(() => clear())

  return {
    stdoutLines,
    spawn,
    kill,
    clear,
    stop,
    processing,
    progress,
  }
}
