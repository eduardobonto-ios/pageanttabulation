import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/Login.vue') }
      ]
    },
    {
      path: '/admin',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', component: () => import('@/pages/AdminDashboard.vue') },
        { path: 'results/:key', component: () => import('@/pages/AdminResults.vue') }
      ]
    },
    {
      path: '/judge',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'judge' },
      children: [
        { path: '', component: () => import('@/pages/JudgeDashboard.vue') },
        { path: 'scoring/:key', component: () => import('@/pages/CategoryScoring.vue') }
      ]
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession()
  const authStore = useAuthStore()

  // 1. If no session, only allow /login
  if (!data.session) {
    if (to.path !== '/login') {
      return next('/login')
    }
    return next()
  }

  // 2. If session exists, ensure profile is loaded
  if (!authStore.initialized) {
    await authStore.init()
  }

  // 3. Handle authenticated user on /login
  if (to.path === '/login') {
    if (authStore.isAdmin) return next('/admin')
    if (authStore.isJudge) return next('/judge')
    // If authenticated but no valid role, sign out to prevent loop
    await authStore.logout()
    return next('/login')
  }

  // 4. Handle protected routes
  if (to.meta.requiresAuth) {
    // If profile failed to load or has no role
    if (!authStore.profile?.role) {
      console.warn('User authenticated but no profile role assigned')
      await authStore.logout()
      return next('/login')
    }

    // Role-based access control
    if (to.meta.role && to.meta.role !== authStore.profile.role) {
      const target = authStore.isAdmin ? '/admin' : '/judge'
      if (to.path === target) return next()
      return next(target)
    }
  }

  next()
});

export default router;
