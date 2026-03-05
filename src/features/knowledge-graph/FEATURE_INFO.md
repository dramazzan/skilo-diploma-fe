# Feature Contract: knowledge-graph

## Цель
Контракт для экрана аналитики слабых мест (knowledge graph) при переходе с локальной telemetry на backend.

## Модели
Текущие локальные модели:
- `LearningTelemetrySession`
- `LearningTelemetryPayload`
- `RoadmapWeaknessInsight` (view-level derived model)

Источники server-данных для расчета графа:
- `RoadmapProgressResponse` (`GET /users/:userId/roadmap-progress`)
- `SkillLevelsResponse` (`GET /users/:userId/skill-levels`)
- `DailyTaskHistoryResponse` (`GET /users/:userId/daily-tasks/history`)
- `TopicResultResponse` (`POST /topics/:topicId/result`)

## Endpoints
### Уже существующие (используются как data sources)
| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/users/:userId/roadmap-progress` | `RoadmapProgressResponse` |
| `GET` | `/users/:userId/skill-levels` | `SkillLevelsResponse` |
| `GET` | `/users/:userId/daily-tasks/history` | `DailyTaskHistoryResponse` |

### Рекомендуемые для прямой миграции telemetry
| Method | Path | Request | Response | Статус |
| --- | --- | --- | --- | --- |
| `POST` | `/users/:userId/learning-telemetry/sessions` | `LearningTelemetryPayload` | `LearningTelemetrySession` | proposed |
| `GET` | `/users/:userId/learning-telemetry/sessions` | - | `LearningTelemetrySession[]` | proposed |

## Пример ответа сервера
```json
{
  "id": "lts-1741160400-ab12cd",
  "userId": 101,
  "type": "topic-test",
  "roadmapId": "frontend",
  "roadmapTitle": "Frontend",
  "topicId": "topic-12",
  "topicTitle": "Vue Routing",
  "sessionLabel": "Topic test",
  "startedAt": "2026-03-05T09:00:00.000Z",
  "finishedAt": "2026-03-05T09:08:10.000Z",
  "durationSec": 490,
  "questionCount": 12,
  "answeredCount": 12,
  "correctCount": 9,
  "wrongCount": 3,
  "scorePercent": 75,
  "answerChangeCount": 4,
  "revisitCount": 3,
  "lowConfidenceCount": 2,
  "failed": false
}
```

## Что заменить при миграции
- `learningTelemetry.ts` должен перейти с localStorage на API transport.
- Расчет агрегатов можно оставить в FE, но первичные telemetry-сессии должны храниться на сервере.
