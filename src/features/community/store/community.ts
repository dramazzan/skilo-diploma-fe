import { computed, ref } from "vue"
import { defineStore } from "pinia"

import { communityApi } from "@/features/community/api/community.api"

export type CommunityAuthorType = "developer" | "company"
export type CommunityModerationStatus = "pending" | "approved" | "rejected"

export interface CommunityComment {
  id: string
  authorName: string
  authorType: CommunityAuthorType
  authorUserId: number | null
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

export const useCommunityStore = defineStore("community", () => {
  const posts = ref<CommunityPost[]>([])
  const loading = ref(false)

  const loadPosts = async () => {
    loading.value = true

    try {
      posts.value = await communityApi.getPosts()
    } finally {
      loading.value = false
    }
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
    const created = await communityApi.createPost(payload)
    posts.value = [created, ...posts.value.filter((post) => post.id !== created.id)]
    return created
  }

  const toggleLike = async (postId: string, userId: number) => {
    const next = await communityApi.toggleLike(postId, userId)

    posts.value = posts.value.map((post) => {
      if (post.id !== postId) return post
      return {
        ...post,
        likes: next.likes,
        likedByUserIds: next.likedByUserIds
      }
    })
  }

  const addComment = async (postId: string, payload: Omit<CommunityComment, "id" | "createdAt">) => {
    const text = payload.text.trim()
    if (!text) return

    const comment = await communityApi.addComment(postId, {
      authorName: payload.authorName.trim() || "Участник Skillo",
      authorType: payload.authorType,
      authorUserId: payload.authorUserId ?? null,
      text
    })

    posts.value = posts.value.map((post) => {
      if (post.id !== postId) return post
      return {
        ...post,
        comments: [...post.comments, comment]
      }
    })
  }

  return {
    posts,
    loading,
    publishedPosts,
    pendingPosts,
    rejectedPosts,
    loadPosts,
    submitPostForModeration,
    toggleLike,
    addComment
  }
})
