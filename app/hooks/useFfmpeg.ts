import { Command, type Child } from '@tauri-apps/plugin-shell'

export const useFfmpeg = () => {
  const stdoutLines = ref<string[]>([])

  const command = shallowRef<Command<string>>()
  const commandChild = shallowRef<Child>()

  const spawn = async (args: string[], listener: (arg: string) => void) => {
    command.value = Command.sidecar('binaries/ffmpeg', args)

    command.value.stdout.on('data', listener)
    command.value.on('close', kill)

    commandChild.value = await command.value.spawn()
  }

  const kill = () => {
    commandChild.value?.kill()
    command.value?.removeAllListeners()

    command.value = undefined
    commandChild.value = undefined
  }

  onUnmounted(() => kill())

  return {
    stdoutLines,
    spawn,
    kill,
  }
}
