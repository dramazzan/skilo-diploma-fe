# Feature Contract: profile

## Цель
Контракт профиля пользователя (основные данные, активность, прогресс, points).

## Модели (server contract)
Источник: `src/shared/types/api-contract.ts`.

- `ProfileResponse`
- `ProfileUpdateRequest`
- `UserActivityResponse` (`UserActivityDay[]`)
- `LeaderboardResponse` (для points текущего пользователя)

## Endpoints
| Method | Path | Request | Response | Используется в FE |
| --- | --- | --- | --- | --- |
| `GET` | `/profile` | - | `ProfileResponse` | пока profile view берет mockProfileData |
| `PATCH` | `/profile` | `ProfileUpdateRequest` | `ProfileResponse` | planned |
| `GET` | `/users/:userId/activity` | - | `UserActivityResponse` | `profileApi.getUserYearActivity` |
| `GET` | `/leaderboard` | - | `LeaderboardResponse` | `profileApi.getLeaderboard` |

## Пример ответа сервера
```json
{
  "id": 101,
  "fullName": "Ramazan D.",
  "email": "student@example.com",
  "createdAt": "2025-11-10T08:00:00.000Z",
  "joinedAt": "2025-11-10T08:00:00.000Z",
  "country": "Kazakhstan",
  "city": "Almaty",
  "university": "Satbayev University",
  "firstLogin": false,
  "completedTests": 42,
  "skills": ["Vue", "TypeScript"],
  "achievements": ["Fast Learner"]
}
```

## Что заменить при миграции
- Убрать зависимость от `mockProfileData` в `ProfileView.vue`.
- Сертификат/резюме оставить как FE-генерацию, но исходные данные брать из `GET /profile`.
