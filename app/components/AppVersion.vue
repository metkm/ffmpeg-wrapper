<script setup lang="ts">
import { getVersion } from '@tauri-apps/api/app'

const version = await getVersion()
</script>

<template>
  <p>
    {{ version }}
  </p>
</template>
