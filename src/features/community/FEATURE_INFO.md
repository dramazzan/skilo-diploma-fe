# Feature Contract: community

## Цель
Контракт ленты сообщества (посты, комментарии, лайки) для замены localStorage (`community_posts_v1`) на backend.

## Модели (server contract)
Источник: `src/shared/types/api-contract.ts`.

- `CommunityPost`
- `CommunityComment`
- `SubmitCommunityPostRequest`
- `CreateCommunityCommentRequest`
- `ToggleCommunityLikeRequest`
- `CommunityPostLikeResponse`
- `CommunityPostsResponse = CommunityPost[]`

Ключевая сущность:
```ts
type CommunityPost = {
  id: string
  title: string
  content: string
  focusArea: string
  tags: string[]
  authorName: string
  authorType: "developer" | "company"
  authorUserId: number | null
  moderationStatus: "pending" | "approved" | "rejected"
  moderationNote: string | null
  likes: number
  likedByUserIds: number[]
  comments: CommunityComment[]
  createdAt: string
  publishedAt: string | null
}
```

## Endpoints
| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/community/posts` | - | `CommunityPostsResponse` |
| `POST` | `/community/posts` | `SubmitCommunityPostRequest` | `CommunityPost` |
| `POST` | `/community/posts/:postId/comments` | `CreateCommunityCommentRequest` | `CommunityComment` |
| `POST` | `/community/posts/:postId/likes` | `ToggleCommunityLikeRequest` | `CommunityPostLikeResponse` |

## Примеры ответов сервера
```json
[
  {
    "id": "post-1",
    "title": "Как ускорить путь Junior -> Middle",
    "content": "...",
    "focusArea": "roadmaps",
    "tags": ["Roadmap", "Practice"],
    "authorName": "Nurgali Dev",
    "authorType": "developer",
    "authorUserId": null,
    "moderationStatus": "approved",
    "moderationNote": null,
    "likes": 18,
    "likedByUserIds": [1, 2],
    "comments": [],
    "createdAt": "2026-02-24T10:15:00.000Z",
    "publishedAt": "2026-02-24T10:15:00.000Z"
  }
]
```

```json
{
  "postId": "post-1",
  "likes": 19,
  "likedByCurrentUser": true
}
```

## Что заменить при миграции
- Store `community.ts` должен перейти с локальной модерации/персиста на API вызовы.
- Модерация должна стать серверной (сейчас выполняется в клиенте через keyword rules).
