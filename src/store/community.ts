import { computed, ref } from "vue"
import { defineStore } from "pinia"

export type CommunityAuthorType = "developer" | "company"
export type CommunityModerationStatus = "pending" | "approved" | "rejected"

export interface CommunityComment {
  id: string
  authorName: string
  authorType: CommunityAuthorType
  text: string
  createdAt: string
}

export interface CommunityPost {
  id: string
  title: string
  content: string
  focusArea: string
  tags: string[]
  authorName: string
  authorType: CommunityAuthorType
  authorUserId: number | null
  createdAt: string
  publishedAt: string | null
  moderationStatus: CommunityModerationStatus
  moderationNote: string | null
  likes: number
  likedByUserIds: number[]
  comments: CommunityComment[]
}

interface SubmitPostPayload {
  title: string
  content: string
  focusArea: string
  tags: string[]
  authorName: string
  authorType: CommunityAuthorType
  authorUserId: number | null
}

const COMMUNITY_POSTS_STORAGE_KEY = "community_posts_v1"

const topicKeywords = [
  "разработ",
  "код",
  "frontend",
  "backend",
  "devops",
  "mobile",
  "ai",
  "ml",
  "интервью",
  "карьер",
  "дорожн",
  "roadmap",
  "тест",
  "навык",
  "алгоритм",
  "архитектур",
  "api",
  "vue",
  "react",
  "javascript",
  "typescript",
  "python",
  "java",
  "docker",
  "kubernetes",
  "ci",
  "cd"
]

const bannedKeywords = [
  "казино",
  "ставк",
  "политик",
  "крипто сигнал",
  "18+",
  "азарт",
  "реклама кредита"
]

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const normalizeLoadedPosts = (rawPosts: CommunityPost[]): CommunityPost[] => {
  return rawPosts.map((post) => ({
    ...post,
    focusArea: post.focusArea ?? "general",
    authorUserId: post.authorUserId ?? null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    likedByUserIds: Array.isArray(post.likedByUserIds) ? post.likedByUserIds : [],
    moderationStatus: post.moderationStatus ?? "approved",
    moderationNote: post.moderationNote ?? null,
    likes: Number.isFinite(post.likes) ? post.likes : 0,
    publishedAt: post.publishedAt ?? null
  }))
}

const normalizeLoadedState = (value: unknown, fallback: CommunityPost[]) => {
  if (!Array.isArray(value)) return fallback
  return normalizeLoadedPosts(value as CommunityPost[])
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

const createSeedPosts = (): CommunityPost[] => {
  return [
    {
      id: "seed-1",
      title: "Как мы ускорили путь Junior → Middle через микропроекты",
      content:
        "За последний квартал мы в команде внедрили формат микропроектов по фронтенду и бэкенду. Ключевая идея: не просто смотреть теорию, а сразу проходить короткие кейсы с код-ревью. В среднем участники ускорили закрытие дорожных карт на 27%, а качество ответов на интервью выросло по внутренним метрикам.",
      focusArea: "roadmaps",
      tags: ["Карьера", "Roadmap", "Практика"],
      authorName: "Nurgali Dev",
      authorType: "developer",
      authorUserId: null,
      createdAt: "2026-02-24T10:15:00.000Z",
      publishedAt: "2026-02-24T10:15:00.000Z",
      moderationStatus: "approved",
      moderationNote: null,
      likes: 18,
      likedByUserIds: [1, 2, 3, 4, 5, 6],
      comments: [
        {
          id: "seed-1-c1",
          authorName: "Aizada",
          authorType: "developer",
          text: "Отличный формат, особенно когда есть обратная связь по архитектуре.",
          createdAt: "2026-02-24T12:10:00.000Z"
        },
        {
          id: "seed-1-c2",
          authorName: "CodeBridge",
          authorType: "company",
          text: "Поддерживаем, такие кейсы хорошо готовят к реальным задачам на проекте.",
          createdAt: "2026-02-24T13:24:00.000Z"
        }
      ]
    },
    {
      id: "seed-2",
      title: "Компания ищет стажеров: акцент на API и quality engineering",
      content:
        "Мы открыли новый поток стажировки в backend-направлении. В отборе смотрим на умение проектировать API-контракты, писать тесты и работать с логами/метриками. Для подготовки рекомендуем пройти дорожку Backend, затем тренажер интервью по системному мышлению и надежности.",
      focusArea: "backend",
      tags: ["Backend", "Стажировка", "Интервью"],
      authorName: "Skilo Partner Team",
      authorType: "company",
      authorUserId: null,
      createdAt: "2026-02-25T08:50:00.000Z",
      publishedAt: "2026-02-25T08:50:00.000Z",
      moderationStatus: "approved",
      moderationNote: null,
      likes: 26,
      likedByUserIds: [4, 7, 8, 9, 10],
      comments: [
        {
          id: "seed-2-c1",
          authorName: "Dias",
          authorType: "developer",
          text: "Спасибо, можно ли податься после прохождения только 70% дорожной карты?",
          createdAt: "2026-02-25T10:11:00.000Z"
        }
      ]
    },
    {
      id: "seed-3",
      title: "История: как подготовка к интервью помогла закрыть оффер в mobile",
      content:
        "Я шел по mobile-дорожке, каждую неделю делал мини-спринт: архитектура, оптимизация рендера, релизный цикл. Параллельно проходил вопросы интервью на платформе и фиксировал слабые места. Через 6 недель получил оффер на Junior Strong, а затем собрал резюме прямо в профиле.",
      focusArea: "mobile",
      tags: ["Mobile", "История", "Оффер"],
      authorName: "Aliya Flutter",
      authorType: "developer",
      authorUserId: null,
      createdAt: "2026-02-26T15:20:00.000Z",
      publishedAt: "2026-02-26T15:20:00.000Z",
      moderationStatus: "approved",
      moderationNote: null,
      likes: 34,
      likedByUserIds: [1, 4, 11, 12, 13, 14],
      comments: [
        {
          id: "seed-3-c1",
          authorName: "StartUp Lab",
          authorType: "company",
          text: "Крутой путь, особенно дисциплина по спринтам. Поздравляем!",
          createdAt: "2026-02-26T16:03:00.000Z"
        }
      ]
    }
  ]
}

const createPostId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `post-${Date.now()}-${Math.round(Math.random() * 10000)}`
}

const createCommentId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `comment-${Date.now()}-${Math.round(Math.random() * 10000)}`
}

const moderatePost = (post: CommunityPost): { status: CommunityModerationStatus; note: string | null } => {
  const title = post.title.trim()
  const content = post.content.trim()
  const joinedText = normalizeText(`${title} ${content} ${post.focusArea} ${post.tags.join(" ")}`)

  if (title.length < 8) {
    return {
      status: "rejected",
      note: "Заголовок слишком короткий. Добавьте больше контекста."
    }
  }

  if (content.length < 80) {
    return {
      status: "rejected",
      note: "Текст поста слишком короткий. Нужен более подробный материал."
    }
  }

  const hasBannedWords = bannedKeywords.some((keyword) => joinedText.includes(keyword))
  if (hasBannedWords) {
    return {
      status: "rejected",
      note: "Пост отклонен модерацией: найден контент не по теме платформы."
    }
  }

  const matchedTopics = topicKeywords.reduce((count, keyword) => {
    return count + (joinedText.includes(keyword) ? 1 : 0)
  }, 0)

  if (matchedTopics < 2) {
    return {
      status: "rejected",
      note: "Пост отклонен: добавьте больше связи с IT-направлениями и развитием навыков."
    }
  }

  return {
    status: "approved",
    note: null
  }
}

export const useCommunityStore = defineStore("community", () => {
  const seedPosts = createSeedPosts()
  const parsedPosts = parseJson<unknown>(localStorage.getItem(COMMUNITY_POSTS_STORAGE_KEY), seedPosts)
  const posts = ref<CommunityPost[]>(
    normalizeLoadedState(parsedPosts, seedPosts)
  )

  const persist = () => {
    localStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify(posts.value))
  }

  const publishedPosts = computed(() => {
    return posts.value
      .filter((post) => post.moderationStatus === "approved")
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
  })

  const pendingPosts = computed(() => {
    return posts.value
      .filter((post) => post.moderationStatus === "pending")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  const rejectedPosts = computed(() => {
    return posts.value
      .filter((post) => post.moderationStatus === "rejected")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  const submitPostForModeration = async (payload: SubmitPostPayload) => {
    const createdAt = new Date().toISOString()
    const nextPost: CommunityPost = {
      id: createPostId(),
      title: payload.title.trim(),
      content: payload.content.trim(),
      focusArea: payload.focusArea.trim().toLowerCase(),
      tags: payload.tags.map((tag) => tag.trim()).filter(Boolean),
      authorName: payload.authorName.trim() || "Участник Skilo",
      authorType: payload.authorType,
      authorUserId: payload.authorUserId,
      createdAt,
      publishedAt: null,
      moderationStatus: "pending",
      moderationNote: "Пост отправлен на модерацию. Проверяем соответствие тематике платформы.",
      likes: 0,
      likedByUserIds: [],
      comments: []
    }

    posts.value = [nextPost, ...posts.value]
    persist()

    await new Promise((resolve) => setTimeout(resolve, 1200))

    const moderation = moderatePost(nextPost)
    const index = posts.value.findIndex((post) => post.id === nextPost.id)

    if (index >= 0) {
      const updatedPost: CommunityPost = {
        ...posts.value[index],
        moderationStatus: moderation.status,
        moderationNote: moderation.note,
        publishedAt: moderation.status === "approved" ? new Date().toISOString() : null
      }
      posts.value[index] = updatedPost
      persist()
      return updatedPost
    }

    return null
  }

  const toggleLike = (postId: string, userId: number) => {
    const post = posts.value.find((item) => item.id === postId)
    if (!post || post.moderationStatus !== "approved") return

    const hasLiked = post.likedByUserIds.includes(userId)
    if (hasLiked) {
      post.likedByUserIds = post.likedByUserIds.filter((id) => id !== userId)
      post.likes = Math.max(0, post.likes - 1)
    } else {
      post.likedByUserIds = [...post.likedByUserIds, userId]
      post.likes += 1
    }

    persist()
  }

  const addComment = (postId: string, payload: Omit<CommunityComment, "id" | "createdAt">) => {
    const post = posts.value.find((item) => item.id === postId)
    if (!post || post.moderationStatus !== "approved") return

    const nextText = payload.text.trim()
    if (!nextText) return

    post.comments = [
      ...post.comments,
      {
        id: createCommentId(),
        authorName: payload.authorName.trim() || "Участник Skilo",
        authorType: payload.authorType,
        text: nextText,
        createdAt: new Date().toISOString()
      }
    ]
    persist()
  }

  return {
    posts,
    publishedPosts,
    pendingPosts,
    rejectedPosts,
    submitPostForModeration,
    toggleLike,
    addComment
  }
})
