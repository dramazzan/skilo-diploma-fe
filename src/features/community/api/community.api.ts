import { api } from "@/shared/api/client"
import type { CommunityComment, CommunityPost } from "@/shared/api/client"

type CommunityAuthorType = "developer" | "company"

export const communityApi = {
  getPosts(): Promise<CommunityPost[]> {
    return api.getCommunityPosts()
  },
  createPost(payload: {
    title: string
    content: string
    focusArea: string
    tags: string[]
    authorName: string
    authorType: CommunityAuthorType
    authorUserId: number | null
  }): Promise<CommunityPost> {
    return api.createCommunityPost(payload)
  },
  addComment(
    postId: string,
    payload: {
      authorName: string
      authorType: CommunityAuthorType
      authorUserId: number | null
      text: string
    }
  ): Promise<CommunityComment> {
    return api.addCommunityComment(postId, payload)
  },
  toggleLike(postId: string, userId: number): Promise<{ postId: string; likes: number; likedByUserIds: number[] }> {
    return api.toggleCommunityLike(postId, userId)
  }
}
