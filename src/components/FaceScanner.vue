<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  intervalMs: {
    type: Number,
    default: 1400,
  },
  autoStart: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['frame', 'error', 'started'])

const videoRef = ref(null)
const canvasRef = ref(null)
const stream = ref(null)
const isStreaming = ref(false)
const scanningTimer = ref(null)
const lastFrame = ref('')
const errorMessage = ref('')

async function startCamera() {
  errorMessage.value = ''
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      await videoRef.value.play()
      isStreaming.value = true
      emit('started')
      startScanning()
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Não foi possível acessar a câmera. Verifique permissões.'
    emit('error', error)
  }
}

function stopCamera() {
  stopScanning()
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
  isStreaming.value = false
}

function captureFrame() {
  if (!videoRef.value || !canvasRef.value) return ''
  const width = videoRef.value.videoWidth || 640
  const height = videoRef.value.videoHeight || 480
  canvasRef.value.width = width
  canvasRef.value.height = height

  const ctx = canvasRef.value.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0, width, height)
  const dataUrl = canvasRef.value.toDataURL('image/jpeg', 0.85)
  lastFrame.value = dataUrl
  emit('frame', dataUrl)
  return dataUrl
}

function startScanning() {
  stopScanning()
  scanningTimer.value = setInterval(() => {
    const shot = captureFrame()
    if (shot) {
      emit('frame', shot)
    }
  }, props.intervalMs)
}

function stopScanning() {
  if (scanningTimer.value) {
    clearInterval(scanningTimer.value)
    scanningTimer.value = null
  }
}

onMounted(() => {
  if (props.autoStart) startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <div class="space-y-2">
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
        class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-center text-sm text-slate-200"
      >
        <p>Solicitando acesso à câmera...</p>
        <p class="text-xs text-slate-400">Aceite para tentar localizar seu rosto automaticamente.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      <span class="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200">
        {{ isStreaming ? 'Câmera ativa' : 'Câmera parada' }}
      </span>
      <span v-if="lastFrame" class="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
        Capturando frames automáticos
      </span>
    </div>

    <div v-if="errorMessage" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
      {{ errorMessage }}
    </div>

    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>
