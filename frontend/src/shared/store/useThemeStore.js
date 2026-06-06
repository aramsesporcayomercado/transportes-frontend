import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },

      initTheme: () => {
        const current = get().theme
        document.documentElement.classList.toggle('dark', current === 'dark')
      },
    }),
    {
      name: 'tp-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)