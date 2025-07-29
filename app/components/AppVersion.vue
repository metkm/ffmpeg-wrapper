<script setup lang="ts">
import { getVersion } from '@tauri-apps/api/app'

const version = await getVersion()
</script>

<template>
  <p class="text-muted font-medium text-right">
    {{ version }}
  </p>
</template>
