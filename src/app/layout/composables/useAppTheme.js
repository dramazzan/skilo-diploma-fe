import { computed, onMounted, ref, watch } from "vue"

const THEME_STORAGE_KEY = "skilo-theme"

export const useAppTheme = () => {
  const theme = ref("light")
  const isDarkTheme = computed(() => theme.value === "dark")

  const applyTheme = (nextTheme) => {
    const normalizedTheme = nextTheme === "dark" ? "dark" : "light"
    theme.value = normalizedTheme
    document.documentElement.setAttribute("data-theme", normalizedTheme)
  }

  const toggleTheme = () => {
    applyTheme(isDarkTheme.value ? "light" : "dark")
  }

  onMounted(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (storedTheme === "light" || storedTheme === "dark") {
      applyTheme(storedTheme)
      return
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    applyTheme(prefersDark ? "dark" : "light")
  })

  watch(theme, (nextTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  })

  return {
    isDarkTheme,
    toggleTheme
  }
}
