<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CameraCapture from '../components/CameraCapture.vue'
import FaceScanner from '../components/FaceScanner.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const loginForm = reactive({
  email: '',
  password: '',
})

const faceLogin = reactive({
  pin: '',
  photoData: '',
  photoName: '',
})

const feedback = reactive({
  login: '',
  face: '',
  auto: '',
})

const loading = reactive({
  login: false,
  face: false,
  auto: false,
})

const autoScanStatus = ref('Solicitando acesso à câmera...')
const autoRecognized = ref(false)
const pinModal = reactive({
  open: false,
  pin: '',
  photoData: '',
  message: '',
})

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })

async function handleFaceUpload(event) {
  feedback.face = ''
  const file = event.target.files?.[0]
  if (!file) return
  faceLogin.photoData = await toBase64(file)
  faceLogin.photoName = file.name
  event.target.value = ''
}

function handleCapture(payload) {
  if (!payload?.dataUrl) return
  faceLogin.photoData = payload.dataUrl
  faceLogin.photoName = payload.name
}

async function loginWithPassword() {
  feedback.login = ''
  loading.login = true
  const res = auth.loginWithPassword(loginForm.email, loginForm.password)
  loading.login = false
  if (!res.ok) {
    feedback.login = res.message
    return
  }
  router.push({ name: 'dashboard' })
}

async function loginWithFace() {
  feedback.face = ''
  loading.face = true
  const res = auth.loginWithFace(faceLogin.pin, faceLogin.photoData)
  loading.face = false
  if (!res.ok) {
    feedback.face = res.message
    return
  }
  router.push({ name: 'dashboard' })
}

function handleAutoFrame(frame) {
  if (!auth.hasStoredUser.value || autoRecognized.value) return
  const recognized = auth.recognizePhoto(frame)
  if (recognized) {
    autoRecognized.value = true
    pinModal.photoData = frame
    pinModal.open = true
    pinModal.pin = ''
    pinModal.message = ''
    autoScanStatus.value = 'Rosto reconhecido! Informe o PIN para entrar.'
  } else {
    autoScanStatus.value = 'Câmera ativa. Buscando um rosto correspondente...'
  }
}

function handleAutoError() {
  feedback.auto = 'Não foi possível acessar a câmera automaticamente. Use o login manual.'
}

function handleAutoStarted() {
  autoScanStatus.value = 'Câmera ativa. Buscando um rosto correspondente...'
}

async function confirmPinOnly() {
  if (!pinModal.photoData) return
  pinModal.message = ''
  loading.auto = true
  const res = auth.loginWithFace(pinModal.pin, pinModal.photoData)
  loading.auto = false
  if (!res.ok) {
    pinModal.message = res.message
    return
  }
  pinModal.open = false
  router.push({ name: 'dashboard' })
}

function closePinModal() {
  pinModal.open = false
  pinModal.pin = ''
  pinModal.photoData = ''
  autoRecognized.value = false
}

if (!auth.hasStoredUser.value) {
  autoScanStatus.value = 'Cadastre um usuário para habilitar o scanner automático.'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-400">Autenticação</p>
        <h2 class="text-2xl font-semibold text-white">Entre com senha ou reconhecimento facial</h2>
      </div>
      <router-link
        to="/registrar"
        class="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:bg-slate-800"
      >
        Preciso criar conta
      </router-link>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 shadow-lg shadow-sky-500/10">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-400">Login instantâneo</p>
            <h3 class="text-lg font-semibold text-white">Scanner facial + PIN</h3>
          </div>
          <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">Automático</span>
        </div>

        <FaceScanner @frame="handleAutoFrame" @error="handleAutoError" @started="handleAutoStarted" />
        <p class="text-sm text-slate-300">{{ autoScanStatus }}</p>
        <p class="text-xs text-slate-500">
          Ao localizar uma face semelhante à cadastrada, abriremos um modal pedindo somente o PIN.
        </p>
        <div
          v-if="feedback.auto"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
        >
          {{ feedback.auto }}
        </div>
      </div>

      <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 shadow-lg shadow-emerald-500/10">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-400">Login tradicional</p>
            <h3 class="text-lg font-semibold text-white">Email + senha</h3>
          </div>
          <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">Rota 1</span>
        </div>

        <form class="mt-3 space-y-3" @submit.prevent="loginWithPassword">
          <label class="block text-sm font-medium text-slate-200">
            Email
            <input
              v-model="loginForm.email"
              type="email"
              class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
              placeholder="email@exemplo.com"
              required
            />
          </label>
          <label class="block text-sm font-medium text-slate-200">
            Senha
            <input
              v-model="loginForm.password"
              type="password"
              class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
              placeholder="Senha cadastrada"
              required
            />
          </label>
          <button
            type="submit"
            class="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading.login"
          >
            {{ loading.login ? 'Entrando...' : 'Entrar com senha' }}
          </button>
          <p class="text-xs text-slate-400">Valida credenciais armazenadas localmente (localStorage).</p>
          <div
            v-if="feedback.login"
            class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
          >
            {{ feedback.login }}
          </div>
        </form>
      </div>
    </div>

    <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 shadow-lg shadow-indigo-500/10">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-400">Login seguro manual</p>
          <h3 class="text-lg font-semibold text-white">Reconhecimento facial + PIN</h3>
        </div>
        <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">Fallback</span>
      </div>

      <form class="mt-3 space-y-3" @submit.prevent="loginWithFace">
        <label class="block text-sm font-medium text-slate-200">
          PIN (6 dígitos)
          <input
            v-model="faceLogin.pin"
            type="text"
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Ex: 123456"
            required
          />
        </label>

        <div class="space-y-2 text-sm text-slate-200">
          <span class="font-medium">Foto para reconhecimento</span>
          <input
            type="file"
            accept="image/*"
            class="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-400"
            @change="handleFaceUpload"
          />
          <p class="text-xs text-slate-400">Ou capture com a câmera abaixo.</p>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <CameraCapture @captured="handleCapture" />
        </div>

        <div
          v-if="faceLogin.photoData"
          class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
        >
          <img :src="faceLogin.photoData" alt="Prévia da face" class="h-14 w-14 rounded-lg object-cover" />
          <div class="text-xs text-slate-300">
            <p class="font-semibold text-slate-100">Pré-visualização</p>
            <p>{{ faceLogin.photoName || 'Foto capturada' }}</p>
          </div>
          <button
            type="button"
            class="ml-auto text-xs font-semibold text-rose-200 hover:text-rose-100"
            @click="
              faceLogin.photoData = '';
              faceLogin.photoName = '';
            "
          >
            Limpar
          </button>
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading.face"
        >
          {{ loading.face ? 'Validando...' : 'Entrar com face + PIN' }}
        </button>
        <p class="text-xs text-slate-400">
          Prova de conceito: compara a foto enviada com as fotos cadastradas e valida o PIN.
        </p>
        <div
          v-if="feedback.face"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
        >
          {{ feedback.face }}
        </div>
      </form>
    </div>

    <div
      v-if="pinModal.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-sky-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-400">Face reconhecida</p>
            <h4 class="text-lg font-semibold text-white">Confirme com seu PIN</h4>
          </div>
          <button
            type="button"
            class="text-sm font-semibold text-slate-300 hover:text-white"
            @click="closePinModal"
          >
            Fechar
          </button>
        </div>

        <div
          v-if="pinModal.photoData"
          class="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
        >
          <img :src="pinModal.photoData" alt="Prévia" class="h-14 w-14 rounded-lg object-cover" />
          <p class="text-xs text-slate-300">Usaremos esta captura para validar o PIN.</p>
        </div>

        <label class="mt-4 block text-sm font-medium text-slate-200">
          PIN (6 dígitos)
          <input
            v-model="pinModal.pin"
            type="text"
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Digite seu PIN"
            autofocus
          />
        </label>

        <div
          v-if="pinModal.message"
          class="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
        >
          {{ pinModal.message }}
        </div>

        <div class="mt-4 flex items-center gap-3">
          <button
            type="button"
            class="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading.auto"
            @click="confirmPinOnly"
          >
            {{ loading.auto ? 'Entrando...' : 'Entrar com PIN' }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            @click="closePinModal"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
