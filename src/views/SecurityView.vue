<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  newPin: '',
})

const feedback = ref('')
const success = ref('')
const loading = ref(false)

async function submit() {
  feedback.value = ''
  success.value = ''
  loading.value = true
  const res = auth.updateSecrets({ ...form })
  loading.value = false
  if (!res.ok) {
    feedback.value = res.message
    return
  }
  success.value = res.message
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  form.newPin = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-400">Segurança</p>
        <h2 class="text-2xl font-semibold text-white">Alterar PIN e senha</h2>
        <p class="text-slate-400">Informe sua senha atual para atualizar o PIN e/ou definir uma nova senha.</p>
      </div>
      <button
        type="button"
        class="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:bg-slate-800"
        @click="router.back()"
      >
        Voltar
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <label class="block text-sm font-medium text-slate-200">
        Senha atual
        <input
          v-model="form.currentPassword"
          type="password"
          class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
          required
        />
      </label>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="block text-sm font-medium text-slate-200">
          Nova senha (opcional)
          <input
            v-model="form.newPassword"
            type="password"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Deixe vazio para manter"
          />
        </label>
        <label class="block text-sm font-medium text-slate-200">
          Confirmar nova senha
          <input
            v-model="form.confirmPassword"
            type="password"
            class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            placeholder="Repita a nova senha"
          />
        </label>
      </div>

      <label class="block text-sm font-medium text-slate-200">
        Novo PIN (6 dígitos, opcional)
        <input
          v-model="form.newPin"
          type="text"
          maxlength="6"
          pattern="[0-9]*"
          inputmode="numeric"
          class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
          placeholder="Ex: 987654"
        />
      </label>

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
          class="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
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
