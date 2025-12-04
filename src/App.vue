<template>
  <div class="min-h-screen px-4 py-8">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-sky-400">Login Facial Demo</p>
          <h1 class="text-3xl font-semibold text-white">Portal de Acesso Seguro</h1>
        </div>
        <nav class="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-200">
          <router-link
            to="/login"
            class="rounded-xl border border-transparent px-3 py-2 transition hover:border-sky-500/60 hover:bg-slate-900"
            active-class="border-sky-500/60 bg-slate-900"
          >
            Login
          </router-link>
          <router-link
            to="/registrar"
            class="rounded-xl border border-transparent px-3 py-2 transition hover:border-sky-500/60 hover:bg-slate-900"
            active-class="border-sky-500/60 bg-slate-900"
          >
            Cadastro
          </router-link>
          <router-link
            to="/dashboard"
            class="rounded-xl border border-transparent px-3 py-2 transition hover:border-sky-500/60 hover:bg-slate-900"
            active-class="border-sky-500/60 bg-slate-900"
          >
            Dashboard
          </router-link>
          <router-link
            to="/perfil"
            class="rounded-xl border border-transparent px-3 py-2 transition hover:border-sky-500/60 hover:bg-slate-900"
            active-class="border-sky-500/60 bg-slate-900"
          >
            Perfil
          </router-link>
          <router-link
            to="/seguranca"
            class="rounded-xl border border-transparent px-3 py-2 transition hover:border-sky-500/60 hover:bg-slate-900"
            active-class="border-sky-500/60 bg-slate-900"
          >
            Segurança
          </router-link>
        </nav>
      </header>

      <section class="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-sky-500/10">
        <router-view />
      </section>
    </div>
  </div>
</template>
