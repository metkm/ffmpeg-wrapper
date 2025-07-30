import { Command, type Child } from '@tauri-apps/plugin-shell'

export const useFfmpeg = () => {
  const stdoutLines = ref<string[]>([])
  const running = ref(false)

  const command = shallowRef<Command<string>>()
  const commandChild = shallowRef<Child>()

  const spawn = async (args: string[], listener?: (arg: string) => void) => {
    kill()

    command.value = Command.sidecar('binaries/ffmpeg', args)

    command.value.stdout.on('data', (arg) => {
      const line = arg.trim()
      stdoutLines.value.push(line)
      listener?.(line)
    })
    command.value.stderr.on('data', (arg) => {
      const line = arg.trim()
      stdoutLines.value.push(line)
      listener?.(line)
    })

    const promise = new Promise<void>(
      (resolve) => {
        command.value?.once('close', () => {
          resolve()
          kill()
        })
      },
    )

    running.value = true
    commandChild.value = await command.value.spawn()

    await promise
  }

  const kill = () => {
    commandChild.value?.kill()
    command.value?.removeAllListeners()

    command.value = undefined
    commandChild.value = undefined
    running.value = false
  }

  const stop = () => {
    stdoutLines.value = []
    kill()
  }

  onUnmounted(() => kill())

  return {
    stdoutLines,
    spawn,
    kill,
    stop,
    running,
  }
}
