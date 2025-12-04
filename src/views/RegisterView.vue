<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CameraCapture from '../components/CameraCapture.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  pin: '',
})

const photos = ref([])
const feedback = ref('')
const success = ref('')
const loading = ref(false)

const photoCountLabel = computed(() => `${photos.value.length} / 5 fotos`)
const canAddMorePhotos = computed(() => photos.value.length < 5)

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })

async function handleUpload(event) {
  feedback.value = ''
  success.value = ''
  const files = Array.from(event.target.files || [])
  for (const file of files) {
    if (!canAddMorePhotos.value) break
    const dataUrl = await toBase64(file)
    photos.value.push({ name: file.name, src: dataUrl })
  }
  event.target.value = ''
}

function handleCapture(payload) {
  if (!payload || !payload.dataUrl || !canAddMorePhotos.value) return
  photos.value.push({ name: payload.name, src: payload.dataUrl })
}

function removePhoto(index) {
  photos.value.splice(index, 1)
}

async function submit() {
  feedback.value = ''
  success.value = ''
  loading.value = true
  const response = auth.registerUser({
    ...form,
    photos: photos.value.map((p) => p.src),
  })
  loading.value = false

  if (!response.ok) {
    feedback.value = response.message
    return
  }

  success.value = response.message
  setTimeout(() => router.push({ name: 'login' }), 800)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-400">Cadastro</p>
        <h2 class="text-2xl font-semibold text-white">Crie sua conta com fotos faciais</h2>
        <p class="text-slate-400">São necessárias de 3 a 5 imagens capturadas da câmera ou enviadas do dispositivo.</p>
      </div>
      <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
        {{ photoCountLabel }}
      </span>
    </div>

    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="block text-sm font-medium text-slate-200">
          Nome
          <input
            v-model="form.firstName"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Seu nome"
            required
          />
        </label>
        <label class="block text-sm font-medium text-slate-200">
          Sobrenome
          <input
            v-model="form.lastName"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Seu sobrenome"
            required
          />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="block text-sm font-medium text-slate-200">
          Email
          <input
            v-model="form.email"
            type="email"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="email@exemplo.com"
            required
          />
        </label>
        <label class="block text-sm font-medium text-slate-200">
          Telefone
          <input
            v-model="form.phone"
            type="tel"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="(xx) xxxxx-xxxx"
            required
          />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="block text-sm font-medium text-slate-200">
          Senha
          <input
            v-model="form.password"
            type="password"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </label>
        <label class="block text-sm font-medium text-slate-200">
          Confirmar senha
          <input
            v-model="form.confirmPassword"
            type="password"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Repita a senha"
            required
          />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="block text-sm font-medium text-slate-200">
          PIN (6 dígitos)
          <input
            v-model="form.pin"
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
          <span class="font-medium">Fotos (3 a 5)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            class="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-400"
            :disabled="!canAddMorePhotos"
            @change="handleUpload"
          />
          <p class="text-xs text-slate-400">Você também pode capturar com a câmera abaixo.</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p class="text-sm font-semibold text-white">Capturar pela câmera</p>
          <CameraCapture @captured="handleCapture" />
        </div>

        <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p class="text-sm font-semibold text-white">Pré-visualização das fotos</p>
          <p class="text-xs text-slate-400">Remova ou capture/envie novas até ter entre 3 e 5 imagens.</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              v-for="(photo, index) in photos"
              :key="photo.name + index"
              class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
            >
              <img :src="photo.src" :alt="photo.name" class="h-28 w-full object-cover" />
              <button
                type="button"
                class="absolute right-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
                @click="removePhoto(index)"
              >
                Remover
              </button>
              <p class="px-3 py-2 text-xs text-slate-300">{{ photo.name }}</p>
            </div>
            <div
              v-if="!photos.length"
              class="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-4 text-center text-sm text-slate-400"
            >
              Nenhuma foto adicionada ainda.
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="feedback"
        class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
      >
        {{ feedback }}
      </div>
      <div
        v-if="success"
        class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
      >
        {{ success }}
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          class="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Salvando...' : 'Finalizar cadastro' }}
        </button>
        <router-link to="/login" class="text-sm font-semibold text-slate-200 hover:text-white">
          Já tenho conta
        </router-link>
      </div>
    </form>
  </div>
</template>
