<script setup>
import { onBeforeUnmount, ref } from 'vue'

const emit = defineEmits(['captured'])

const videoRef = ref(null)
const canvasRef = ref(null)
const stream = ref(null)
const isStreaming = ref(false)
const preview = ref('')
const error = ref('')

async function startCamera() {
  error.value = ''
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      await videoRef.value.play()
      isStreaming.value = true
    }
  } catch (err) {
    console.error(err)
    error.value = 'Não foi possível acessar a câmera. Verifique permissões.'
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
  isStreaming.value = false
}

function captureFrame() {
  if (!videoRef.value || !canvasRef.value) return

  const width = videoRef.value.videoWidth || 640
  const height = videoRef.value.videoHeight || 480
  canvasRef.value.width = width
  canvasRef.value.height = height

  const ctx = canvasRef.value.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0, width, height)
  const dataUrl = canvasRef.value.toDataURL('image/jpeg', 0.92)
  preview.value = dataUrl
  emit('captured', { dataUrl, name: `captura-${Date.now()}.jpg` })
}

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <div class="space-y-3">
    <div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <video
        ref="videoRef"
        playsinline
        muted
        class="block h-52 w-full object-cover sm:h-64"
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA=="
      ></video>
      <div
        v-if="!isStreaming"
        class="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-sm text-slate-200"
      >
        <p>Ative a câmera para capturar o rosto</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-sm">
      <button
        type="button"
        class="rounded-xl bg-sky-500 px-3 py-2 font-semibold text-white transition hover:bg-sky-400"
        @click="isStreaming ? stopCamera() : startCamera()"
      >
        {{ isStreaming ? 'Parar câmera' : 'Iniciar câmera' }}
      </button>
      <button
        type="button"
        class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!isStreaming"
        @click="captureFrame"
      >
        Capturar foto
      </button>
      <p class="text-slate-400">Use boa iluminação e mantenha o rosto centralizado.</p>
    </div>

    <div v-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
      {{ error }}
    </div>

    <div
      v-if="preview"
      class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-200"
    >
      <img :src="preview" alt="Prévia da face" class="h-16 w-16 rounded-lg object-cover" />
      <div>
        <p class="font-semibold">Última captura</p>
        <p class="text-slate-400">Foto enviada automaticamente para o formulário.</p>
      </div>
    </div>

    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>
