# Feature Contract: daily-tasks

## Цель
Контракт ежедневных заданий и квизов для замены генерации в store на серверные данные.

## Модели (server contract)
Источник: `src/shared/types/api-contract.ts`.

- `DailyTaskItem`
- `DailyTasksTodayResponse`
- `DailyTaskHistoryResponse`
- `DailyTaskQuiz`
- `DailyTaskAnswerSubmitRequest`
- `DailyTaskAnswerSubmitResponse`
- `DailyTaskReminderDismissRequest`
- `DailyTaskReminderDismissResponse`

## Endpoints
| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/users/:userId/daily-tasks/today` | - | `DailyTasksTodayResponse` |
| `GET` | `/users/:userId/daily-tasks/history` | - | `DailyTaskHistoryResponse` |
| `GET` | `/users/:userId/daily-tasks/:taskId/quiz` | - | `DailyTaskQuiz` |
| `POST` | `/users/:userId/daily-tasks/:taskId/answer` | `DailyTaskAnswerSubmitRequest` | `DailyTaskAnswerSubmitResponse` |
| `POST` | `/users/:userId/daily-tasks/reminder/dismiss` | `DailyTaskReminderDismissRequest` | `DailyTaskReminderDismissResponse` |

## Пример ответа сервера
```json
{
  "date": "2026-03-05",
  "tasks": [
    {
      "id": "roadmap-test:frontend:topic-12",
      "date": "2026-03-05",
      "roadmapId": "frontend",
      "roadmapTitle": "Frontend",
      "nodeId": "topic-12",
      "nodeTitle": "Vue Routing",
      "description": "Тест по теме...",
      "points": 80,
      "completed": false,
      "completedAt": null
    }
  ],
  "completedCount": 0,
  "totalCount": 1,
  "earnedPoints": 0,
  "totalPoints": 80
}
```

## Что заменить при миграции
- Store `dailyTasks.ts` не должен генерировать задания на клиенте.
- `localStorage` ключи (`daily_tasks_db`, `daily_tasks_reminder_dismissed`) заменить на backend state.
