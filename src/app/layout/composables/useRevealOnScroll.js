import { nextTick, onBeforeUnmount, onMounted } from "vue"

const REVEAL_SELECTOR = [
  ".app-main .hero-card",
  ".app-main .card",
  ".app-main .profile-card",
  ".app-main .roadmap-card",
  ".app-main .assessment-card",
  ".app-main .question-card",
  ".app-main .direction-card",
  ".app-main .result-card",
  ".app-main .vacancy-card",
  ".app-main .friend-card",
  ".app-main .community-post-card",
  ".app-main .leader-card",
  ".app-main .topic-card",
  ".app-main .daily-task-card",
  ".app-main section",
  ".app-main article"
].join(", ")

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export const useRevealOnScroll = () => {
  let revealObserver = null
  let revealMutationObserver = null
  let revealFrameId = 0

  const shouldAnimateReveal = (element) => {
    if (!(element instanceof HTMLElement)) return false
    if (element.classList.contains("reveal-visible")) return false
    if (element.closest(".daily-reminder")) return false
    if (element.closest('[role="dialog"]')) return false
    if (element.offsetHeight < 64 && element.offsetWidth < 180) return false
    return true
  }

  const ensureRevealObserver = () => {
    if (revealObserver || window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const element = entry.target
          element.classList.add("reveal-visible")
          observer.unobserve(element)
        })
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    )

    revealObserver = observer
  }

  const applyRevealAnimations = () => {
    ensureRevealObserver()
    if (!revealObserver) return

    const revealElements = document.querySelectorAll(REVEAL_SELECTOR)

    revealElements.forEach((element, index) => {
      if (!shouldAnimateReveal(element)) return
      if (element.classList.contains("reveal-on-scroll")) return

      element.classList.add("reveal-on-scroll")
      element.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 35}ms`)
      revealObserver.observe(element)
    })
  }

  const scheduleRevealScan = () => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    if (revealFrameId) {
      window.cancelAnimationFrame(revealFrameId)
    }

    revealFrameId = window.requestAnimationFrame(() => {
      revealFrameId = 0
      applyRevealAnimations()
    })
  }

  onMounted(() => {
    nextTick(() => {
      scheduleRevealScan()

      const appMain = document.querySelector(".app-main")
      if (!appMain) return

      revealMutationObserver = new MutationObserver(() => {
        scheduleRevealScan()
      })

      revealMutationObserver.observe(appMain, {
        childList: true,
        subtree: true
      })
    })
  })

  onBeforeUnmount(() => {
    if (revealFrameId) {
      window.cancelAnimationFrame(revealFrameId)
      revealFrameId = 0
    }

    if (revealObserver) {
      revealObserver.disconnect()
      revealObserver = null
    }

    if (revealMutationObserver) {
      revealMutationObserver.disconnect()
      revealMutationObserver = null
    }
  })

  return {
    scheduleRevealScan
  }
}
