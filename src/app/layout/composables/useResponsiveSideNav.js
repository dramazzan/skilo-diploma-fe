import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"

const DESKTOP_NAV_MEDIA_QUERY = "(min-width: 1100px)"
const DESKTOP_NAV_VISIBILITY_KEY = "skilo-desktop-nav-visible"

export const useResponsiveSideNav = () => {
  const isNavDrawerOpen = ref(false)
  const isDesktopNavPinned = ref(false)
  const isDesktopNavVisible = ref(true)
  const isSideNavOpen = computed(() => {
    return isDesktopNavPinned.value ? isDesktopNavVisible.value : isNavDrawerOpen.value
  })

  let desktopNavMediaQuery = null
  let onDesktopNavChange = null

  const closeNavDrawer = () => {
    if (isDesktopNavPinned.value) {
      isDesktopNavVisible.value = false
      return
    }

    isNavDrawerOpen.value = false
  }

  const toggleNavDrawer = () => {
    if (isDesktopNavPinned.value) {
      isDesktopNavVisible.value = !isDesktopNavVisible.value
      return
    }

    isNavDrawerOpen.value = !isNavDrawerOpen.value
  }

  const handleNavLinkClick = () => {
    if (!isDesktopNavPinned.value) {
      closeNavDrawer()
    }
  }

  onMounted(() => {
    desktopNavMediaQuery = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY)
    onDesktopNavChange = (event) => {
      isDesktopNavPinned.value = event.matches

      if (event.matches) {
        isNavDrawerOpen.value = false
      }
    }

    onDesktopNavChange(desktopNavMediaQuery)
    desktopNavMediaQuery.addEventListener("change", onDesktopNavChange)

    const storedDesktopNavVisibility = localStorage.getItem(DESKTOP_NAV_VISIBILITY_KEY)
    if (storedDesktopNavVisibility === "0") {
      isDesktopNavVisible.value = false
    }
  })

  watch(isDesktopNavVisible, (isVisible) => {
    localStorage.setItem(DESKTOP_NAV_VISIBILITY_KEY, isVisible ? "1" : "0")
  })

  watch(isNavDrawerOpen, (isOpen) => {
    if (isDesktopNavPinned.value) {
      document.body.style.overflow = ""
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
  })

  onBeforeUnmount(() => {
    if (desktopNavMediaQuery && onDesktopNavChange) {
      desktopNavMediaQuery.removeEventListener("change", onDesktopNavChange)
      onDesktopNavChange = null
      desktopNavMediaQuery = null
    }

    document.body.style.overflow = ""
  })

  return {
    isDesktopNavPinned,
    isDesktopNavVisible,
    isNavDrawerOpen,
    isSideNavOpen,
    closeNavDrawer,
    toggleNavDrawer,
    handleNavLinkClick
  }
}
