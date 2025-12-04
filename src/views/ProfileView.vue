<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CameraCapture from '../components/CameraCapture.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const user = computed(() => auth.currentUser.value || auth.state.storedUser)

const form = reactive({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
})

const photos = ref((user.value?.photos || []).map((src, idx) => ({ name: `foto-${idx + 1}.jpg`, src })))
const feedback = ref('')
const success = ref('')
const loading = ref(false)

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
    if (photos.value.length >= 5) break
    const dataUrl = await toBase64(file)
    photos.value.push({ name: file.name, src: dataUrl })
  }
  event.target.value = ''
}

function handleCapture(payload) {
  if (!payload?.dataUrl || photos.value.length >= 5) return
  photos.value.push({ name: payload.name, src: payload.dataUrl })
}

function removePhoto(index) {
  photos.value.splice(index, 1)
}

async function submit() {
  feedback.value = ''
  success.value = ''
  loading.value = true
  const res = auth.updateProfile({
    ...form,
    photos: photos.value.map((p) => p.src),
  })
  loading.value = false
  if (!res.ok) {
    feedback.value = res.message
    return
  }
  success.value = res.message
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-400">Perfil</p>
        <h2 class="text-2xl font-semibold text-white">Edite seus dados e biblioteca facial</h2>
        <p class="text-slate-400">Mantenha entre 3 e 5 fotos atualizadas para melhorar a correspondência.</p>
      </div>
      <button
        type="button"
        class="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:bg-slate-800"
        @click="router.back()"
      >
        Voltar
      </button>
    </div>

    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="block text-sm font-medium text-slate-200">
          Nome
          <input
            v-model="form.firstName"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            required
          />
        </label>
        <label class="block text-sm font-medium text-slate-200">
          Sobrenome
          <input
            v-model="form.lastName"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
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
            required
          />
        </label>
        <label class="block text-sm font-medium text-slate-200">
          Telefone
          <input
            v-model="form.phone"
            type="tel"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            required
          />
        </label>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-white">Capturar pela câmera</p>
            <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
              {{ photos.length }} / 5
            </span>
          </div>
          <CameraCapture @captured="handleCapture" />
        </div>

        <div class="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p class="text-sm font-semibold text-white">Pré-visualização das fotos</p>
          <input
            type="file"
            accept="image/*"
            multiple
            class="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-400"
            :disabled="photos.length >= 5"
            @change="handleUpload"
          />
          <p class="text-xs text-slate-400">Envie ou capture novas fotos (mínimo 3, máximo 5).</p>
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
          {{ loading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
        <router-link to="/dashboard" class="text-sm font-semibold text-slate-200 hover:text-white">
          Ir para o dashboard
        </router-link>
      </div>
    </form>
  </div>
</template>
