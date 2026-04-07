<template>
  <div class="bg-slate-900 rounded-3xl shadow-2xl shadow-teal-900/10 border border-slate-800 p-8 md:p-12">
    <div class="text-center mb-10">
      <div class="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-900/20 mx-auto mb-6">
        <Trophy :size="32" />
      </div>
      <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
      <p class="text-slate-400 mt-2">Sign in to access the tabulation system</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div class="space-y-1.5">
        <label class="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
        <div class="relative">
          <input 
            v-model="email"
            type="email" 
            placeholder="name@example.com"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all pl-12"
            required
          />
          <Mail :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-semibold text-slate-300 ml-1">Password</label>
        <div class="relative">
          <input 
            v-model="password"
            :type="showPassword ? 'text' : 'password'" 
            placeholder="••••••••"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all pl-12"
            required
          />
          <Lock :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Eye v-if="!showPassword" :size="20" />
            <EyeOff v-else :size="20" />
          </button>
        </div>
      </div>

      <div v-if="error" class="bg-red-950/20 text-red-400 text-sm p-4 rounded-2xl border border-red-900/50 flex items-center gap-3">
        <AlertCircle :size="18" />
        {{ error }}
      </div>

      <button 
        type="submit"
        :disabled="loading"
        class="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-900/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span v-if="!loading">Sign In</span>
        <Loader2 v-else class="animate-spin" :size="20" />
      </button>
    </form>

    <div class="mt-8 pt-8 border-t border-slate-800 text-center">
      <p class="text-sm text-slate-500">
        Professional Pageant Tabulation System v1.0
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { 
  Trophy, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    console.log('Login data:', data)
    if (authError) {
      console.error('Login error:', authError)
      if (authError.message.includes('secret API key')) {
        error.value = 'Configuration Error: You are using a secret "service_role" key in the frontend. Please use the "anon" public key instead.'
      } else {
        error.value = authError.message || 'Invalid login credentials'
      }
      throw authError
    }

    if (!data.user) throw new Error('User not found')

    // After login, initialize auth store to get profile/role
    await authStore.init()

    if (!authStore.profile) {
      error.value = 'Your account exists but no profile role has been assigned yet. Please contact admin.'
      await authStore.logout()
      return
    }

    if (authStore.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/judge')
    }
  } catch (err: any) {
    if (!error.value) {
      error.value = err.message || 'Invalid login credentials'
    }
  } finally {
    loading.value = false
  }
}
</script>
