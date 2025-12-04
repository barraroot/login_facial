<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const auth = useAuth()
const router = useRouter()

const user = computed(() => auth.currentUser.value)
const displayName = computed(() => (user.value ? `${user.value.firstName} ${user.value.lastName}` : 'usuário'))
const loginMethod = computed(() => auth.state.loginMethod || 'sessão restaurada')

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-400">Dashboard</p>
        <h2 class="text-2xl font-semibold text-white">Bem-vindo(a), {{ displayName }}</h2>
        <p class="text-slate-400">Login via {{ loginMethod }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <router-link
          to="/perfil"
          class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:bg-slate-800"
        >
          Editar perfil
        </router-link>
        <router-link
          to="/seguranca"
          class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:bg-slate-800"
        >
          PIN e senha
        </router-link>
        <button
          type="button"
          class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          @click="logout"
        >
          Encerrar sessão
        </button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl shadow-emerald-500/10">
        <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p class="text-sm text-slate-400">Dados cadastrais</p>
          <div class="mt-3 grid gap-2 text-sm text-slate-200 md:grid-cols-2">
            <p><span class="text-slate-400">Nome:</span> {{ displayName }}</p>
            <p><span class="text-slate-400">Email:</span> {{ user?.email }}</p>
            <p><span class="text-slate-400">Telefone:</span> {{ user?.phone }}</p>
            <p><span class="text-slate-400">PIN:</span> {{ user?.pin }}</p>
          </div>
        </div>

        <div>
          <p class="text-sm text-slate-400">Biblioteca facial cadastrada</p>
          <div
            class="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:grid-cols-3 md:grid-cols-4"
          >
            <div
              v-for="photo in user?.photos || []"
              :key="photo"
              class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
            >
              <img :src="photo" alt="Foto facial" class="h-28 w-full object-cover" />
            </div>
          </div>
          <p class="mt-2 text-xs text-slate-500">As imagens ficam somente no seu navegador (localStorage).</p>
        </div>
      </div>

      <aside class="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl shadow-sky-500/10">
        <h3 class="text-lg font-semibold text-white">Notas rápidas</h3>
        <ul class="space-y-2 text-sm text-slate-200">
          <li>• Simulação local de reconhecimento facial (comparação simplificada de fotos).</li>
          <li>• Capture com boa iluminação para melhorar a similaridade.</li>
          <li>• Para testar, cadastre de 3 a 5 fotos e faça login com o PIN + nova foto.</li>
        </ul>
        <button
          type="button"
          class="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          @click="logout"
        >
          Sair agora
        </button>
      </aside>
    </div>
  </div>
</template>
