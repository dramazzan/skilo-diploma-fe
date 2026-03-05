# Feature Contract: leaders

## Цель
Контракт лидерборда пользователей и рейтинга по качеству работ.

## Модели (server contract)
Источник: `src/shared/api/types.ts` и `src/shared/types/api-contract.ts`.

- `LeaderboardEntry`
- `LeaderboardResponse`
- `CandidateWorkLeaderboardEntry`
- `CandidateWorkLeaderboardResponse`

## Endpoints
| Method | Path | Response | FE API |
| --- | --- | --- | --- |
| `GET` | `/leaderboard` | `LeaderboardResponse` | `leadersApi.getLeaderboard` |
| `GET` | `/leaderboard/candidate-work` | `CandidateWorkLeaderboardResponse` | пока не подключен в отдельный feature API |

## Пример ответа сервера
```json
{
  "leaders": [
    {
      "userId": 101,
      "fullName": "You",
      "avatar": "Y",
      "country": "Kazakhstan",
      "city": "Almaty",
      "university": "Satbayev University",
      "points": 2140,
      "completedTests": 42,
      "passedTests": 36,
      "failedTests": 6,
      "roadmapProgressPercent": 74,
      "badges": ["Fast Learner"],
      "rank": 2
    }
  ],
  "currentUser": {
    "userId": 101,
    "fullName": "You",
    "avatar": "Y",
    "country": "Kazakhstan",
    "city": "Almaty",
    "university": "Satbayev University",
    "points": 2140,
    "completedTests": 42,
    "passedTests": 36,
    "failedTests": 6,
    "roadmapProgressPercent": 74,
    "badges": ["Fast Learner"],
    "rank": 2
  }
}
```

## Что заменить при миграции
- Добавить query-параметры фильтрации на backend (страна/город/университет) вместо фильтра только на клиенте.
