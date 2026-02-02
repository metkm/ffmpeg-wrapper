import { Command, type Child } from '@tauri-apps/plugin-shell'

interface UseCommandOptions {
  onLine?: (line: string) => void
  onClose?: () => void
}

export const useCommand = (options?: UseCommandOptions) => {
  const command = shallowRef<Command<string>>()
  const child = shallowRef<Child>()

  const running = ref(false)

  const lines = ref<string[]>([])
  const linesDebounced = refDebounced<string[]>(lines, 200, { maxWait: 200 })

  const onData = (_arg: string) => {
    const line = _arg.trimEnd()

    lines.value = [...lines.value, line]

    options?.onLine?.(line)
  }

  const kill = async () => {
    running.value = false
    options?.onClose?.()

    child.value?.kill()
      .then(() => {
        command.value?.removeAllListeners()
      })
      .finally(() => {
        command.value = undefined
        child.value = undefined
      })
  }

  const spawn = async (...args: Parameters<typeof Command.sidecar>) => {
    kill()
    lines.value = []

    command.value = Command.sidecar(...args)

    command.value.stdout.on('data', onData)
    command.value.stderr.on('data', onData)

    command.value.once('close', kill)
    command.value.once('error', kill)

    child.value = await command.value.spawn()
    running.value = true

    return new Promise((resolve) => {
      command.value?.once('close', resolve)
    })
  }

  onScopeDispose(kill, true)

  return {
    command,
    child,
    lines,
    linesDebounced,
    kill,
    spawn,
    running,
  }
}
