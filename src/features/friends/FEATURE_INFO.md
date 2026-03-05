# Feature Contract: friends

## Цель
Контракт social-модуля: друзья, рекомендации, Global IT Map, челленджи и уведомления.

## Модели (server contract)
Источник: `src/shared/api/types.ts` и `src/shared/types/api-contract.ts`.

- `FriendProfile`
- `GlobalItMapResponse`
- `AddFriendByEmailRequest`
- `FriendChallenge`
- `CreateFriendChallengePayload`
- `FriendChallengeNotification`
- `MutationSuccessResponse { success: boolean }`

## Endpoints
| Method | Path | Request | Response | FE API |
| --- | --- | --- | --- | --- |
| `GET` | `/users/:userId/friends` | - | `FriendProfile[]` | `friendsApi.getFriends` |
| `GET` | `/users/:userId/friends/suggestions` | - | `FriendProfile[]` | `friendsApi.getFriendSuggestions` |
| `POST` | `/users/:userId/friends` | `AddFriendByEmailRequest` | `FriendProfile[]` | `friendsApi.addFriendByEmail` |
| `DELETE` | `/users/:userId/friends/:friendUserId` | - | `FriendProfile[]` | `friendsApi.removeFriend` |
| `GET` | `/users/:userId/global-it-map` | - | `GlobalItMapResponse` | `friendsApi.getGlobalItMap` |
| `GET` | `/users/:userId/friend-challenges` | - | `FriendChallenge[]` | `friendsApi.getFriendChallenges` |
| `POST` | `/users/:userId/friend-challenges` | `CreateFriendChallengePayload` | `FriendChallenge` | `friendsApi.createFriendChallenge` |
| `GET` | `/users/:userId/friend-challenges/notifications` | - | `FriendChallengeNotification[]` | `friendsApi.getFriendChallengeNotifications` |
| `PATCH` | `/users/:userId/friend-challenges/:challengeId/notifications/read` | - | `MutationSuccessResponse` | `friendsApi.markFriendChallengeNotificationRead` |

## Пример ответа сервера
```json
{
  "id": "friend-challenge-1",
  "challengerUserId": 101,
  "opponentUserId": 202,
  "opponentName": "Aizada",
  "roadmapId": "backend",
  "roadmapTitle": "Backend",
  "challengerScore": 84,
  "challengerDurationSec": 410,
  "opponentScore": null,
  "opponentDurationSec": null,
  "winnerUserId": null,
  "status": "waiting_opponent",
  "createdAt": "2026-03-05T09:40:00.000Z",
  "completedAt": null,
  "isNotificationRead": true
}
```

## Что заменить при миграции
- Вынести серверную логику определения победителя (сейчас эмуляция в `social.service.ts`).
- Добавить backend event/notification delivery вместо polling-модели.
