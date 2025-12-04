import { computed, reactive } from 'vue'

const USER_KEY = 'face-auth:user'
const SESSION_KEY = 'face-auth:session'

const state = reactive({
  storedUser: loadUser(),
  sessionEmail: localStorage.getItem(SESSION_KEY) || '',
  loginMethod: '',
})

function loadUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.error('Erro ao carregar usuário salvo', error)
    return null
  }
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  state.storedUser = user
}

function startSession(user, method) {
  state.sessionEmail = user.email
  state.loginMethod = method
  localStorage.setItem(SESSION_KEY, user.email)
}

function clearSession() {
  state.sessionEmail = ''
  state.loginMethod = ''
  localStorage.removeItem(SESSION_KEY)
}

function validateRegistration(data) {
  const errors = []
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!data.firstName.trim()) errors.push('Informe o nome.')
  if (!data.lastName.trim()) errors.push('Informe o sobrenome.')
  if (!emailPattern.test(data.email.trim())) errors.push('Email inválido.')
  if (!data.phone.trim()) errors.push('Informe o telefone.')
  if (data.password.length < 6) errors.push('Senha deve ter ao menos 6 caracteres.')
  if (data.password !== data.confirmPassword) errors.push('As senhas não conferem.')
  if (!/^[0-9]{6}$/.test(data.pin.trim())) errors.push('PIN deve ter exatamente 6 números.')
  if (!Array.isArray(data.photos) || data.photos.length < 3 || data.photos.length > 5) {
    errors.push('Envie entre 3 e 5 fotos para reconhecimento facial.')
  }

  return errors
}

function registerUser(form) {
  const validationErrors = validateRegistration(form)
  if (validationErrors.length) {
    return { ok: false, message: validationErrors.join(' ') }
  }

  const normalizedEmail = form.email.trim().toLowerCase()
  const user = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: normalizedEmail,
    phone: form.phone.trim(),
    password: form.password,
    pin: form.pin.trim(),
    photos: form.photos,
    createdAt: Date.now(),
  }

  saveUser(user)
  clearSession()
  return { ok: true, message: 'Cadastro salvo localmente. Faça login para acessar o dashboard.' }
}

function loginWithPassword(email, password) {
  if (!state.storedUser) return { ok: false, message: 'Cadastre um usuário primeiro.' }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !password) return { ok: false, message: 'Preencha email e senha.' }

  if (normalizedEmail !== state.storedUser.email) return { ok: false, message: 'Email não encontrado.' }
  if (password !== state.storedUser.password) return { ok: false, message: 'Senha incorreta.' }

  startSession(state.storedUser, 'senha')
  return { ok: true }
}

function isPhotoSimilar(storedPhotos, candidate) {
  if (!candidate) return false
  return storedPhotos.some((photo) => {
    if (photo === candidate) return true
    const diff = Math.abs(photo.length - candidate.length) / photo.length
    return diff < 0.2
  })
}

function loginWithFace(pin, photoData) {
  if (!state.storedUser) return { ok: false, message: 'Cadastre um usuário primeiro.' }

  if (!/^[0-9]{6}$/.test(pin.trim())) return { ok: false, message: 'PIN deve ter 6 números.' }
  if (pin.trim() !== state.storedUser.pin) return { ok: false, message: 'PIN incorreto.' }
  if (!photoData) return { ok: false, message: 'Envie uma foto para reconhecimento.' }

  const recognized = isPhotoSimilar(state.storedUser.photos, photoData)
  if (!recognized) {
    return {
      ok: false,
      message:
        'Rosto não reconhecido nesta simulação. Tente tirar a foto em boa iluminação e com o rosto centralizado.',
    }
  }

  startSession(state.storedUser, 'reconhecimento facial + PIN')
  return { ok: true }
}

function updateProfile(payload) {
  if (!state.storedUser) return { ok: false, message: 'Nenhum usuário salvo.' }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!payload.firstName.trim()) return { ok: false, message: 'Informe o nome.' }
  if (!payload.lastName.trim()) return { ok: false, message: 'Informe o sobrenome.' }
  if (!emailPattern.test(payload.email.trim())) return { ok: false, message: 'Email inválido.' }
  if (!payload.phone.trim()) return { ok: false, message: 'Informe o telefone.' }

  const photos = payload.photos || state.storedUser.photos
  if (!Array.isArray(photos) || photos.length < 3 || photos.length > 5) {
    return { ok: false, message: 'Mantenha entre 3 e 5 fotos para reconhecimento.' }
  }

  const updated = {
    ...state.storedUser,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    photos,
  }

  saveUser(updated)
  if (state.sessionEmail) startSession(updated, state.loginMethod || 'sessão atualizada')
  return { ok: true, message: 'Perfil atualizado com sucesso.' }
}

function updateSecrets(payload) {
  if (!state.storedUser) return { ok: false, message: 'Nenhum usuário salvo.' }

  if (!payload.currentPassword || payload.currentPassword !== state.storedUser.password) {
    return { ok: false, message: 'Senha atual incorreta.' }
  }

  const next = { ...state.storedUser }

  if (payload.newPassword) {
    if (payload.newPassword.length < 6) return { ok: false, message: 'Nova senha deve ter ao menos 6 caracteres.' }
    if (payload.newPassword !== payload.confirmPassword) {
      return { ok: false, message: 'Confirmação de senha não confere.' }
    }
    next.password = payload.newPassword
  }

  if (payload.newPin) {
    if (!/^[0-9]{6}$/.test(payload.newPin.trim())) return { ok: false, message: 'PIN deve ter 6 números.' }
    next.pin = payload.newPin.trim()
  }

  saveUser(next)
  if (state.sessionEmail) startSession(next, state.loginMethod || 'sessão atualizada')
  return { ok: true, message: 'Senha/PIN atualizados.' }
}

function recognizePhoto(photoData) {
  if (!state.storedUser) return false
  return isPhotoSimilar(state.storedUser.photos, photoData)
}

export function useAuth() {
  const currentUser = computed(() =>
    state.sessionEmail && state.storedUser && state.storedUser.email === state.sessionEmail
      ? state.storedUser
      : null,
  )

  const hasStoredUser = computed(() => !!state.storedUser)

  return {
    state,
    currentUser,
    hasStoredUser,
    registerUser,
    loginWithPassword,
    loginWithFace,
    updateProfile,
    updateSecrets,
    recognizePhoto,
    logout: clearSession,
  }
}
