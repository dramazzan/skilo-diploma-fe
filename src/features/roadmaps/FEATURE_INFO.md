# Feature Contract: roadmaps

## Цель
Контракт учебного домена: roadmap-коллекция, ассессмент, темы, тесты, интервью-вопросы, кастомные AI-треки.

## Модели (server contract)
Источник: `src/shared/types/api-contract.ts` (+ часть из `src/shared/api/types.ts`).

- `Roadmap`, `RoadmapNode`, `RoadmapProgressItem`
- `RoadmapAssessment`, `AssessmentSubmitRequest`, `AssessmentSubmitResponse`
- `RoadmapTopic`, `TopicContent`, `TopicTest`, `TopicResultResponse`
- `InterviewQuestionItem`
- `CustomTrack`, `GenerateCustomTrackRequest`, `GenerateCustomTrackResponse`
- `UserRoadmapIdsResponse` (`string[]`)

## Endpoints
| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/roadmaps` | - | `RoadmapListResponse` |
| `GET` | `/roadmaps/tree` | - | `RoadmapTreeResponse` |
| `GET` | `/roadmaps/:roadmapId/assessment` | - | `RoadmapAssessment` |
| `POST` | `/roadmaps/:roadmapId/assessment/submit` | `AssessmentSubmitRequest` | `AssessmentSubmitResponse` |
| `GET` | `/users/:userId/roadmaps` | - | `UserRoadmapIdsResponse` |
| `PUT` | `/users/:userId/roadmaps` | `UpdateUserRoadmapCollectionRequest` | `UserRoadmapIdsResponse` |
| `DELETE` | `/users/:userId/roadmaps/:roadmapId` | - | `UserRoadmapIdsResponse` |
| `GET` | `/users/:userId/roadmap-progress` | - | `RoadmapProgressResponse` |
| `GET` | `/topics` | - | `TopicListResponse` |
| `GET` | `/topics/:topicId/content` | - | `TopicContentResponse` |
| `GET` | `/topics/:topicId/test` | - | `TopicTestsResponse` |
| `POST` | `/topics/:topicId/result` | `TopicResultResponse` | `TopicResultResponse` |
| `GET` | `/topics/:topicId/interview-questions` | - | `TopicInterviewQuestionsResponse` |
| `GET` | `/users/:userId/custom-tracks` | - | `CustomTrackListResponse` |
| `POST` | `/users/:userId/custom-tracks/generate` | `GenerateCustomTrackRequest` | `GenerateCustomTrackResponse` |
| `DELETE` | `/users/:userId/custom-tracks/:trackId` | - | `MutationSuccessResponse` |

## Пример ответа сервера
```json
[
  {
    "roadmapId": "frontend",
    "completionPercent": 64,
    "completedTopics": 18,
    "totalTopics": 28
  }
]
```

## Что заменить при миграции
- Убрать прямое чтение из `mockRoadmaps/mockRoadmap/mockRoadmapAssessments` во view.
- Заменить localStorage ключи (`user_roadmap_*`, `topic_test_results`, `custom_ai_tracks`) на API.
