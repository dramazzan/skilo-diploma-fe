# Feature Contract: skill-levels

## Цель
Контракт оценки уровня по направлениям (теория + письменные ответы) и хранения результата.

## Модели (server contract)
Источник: `src/shared/types/api-contract.ts`.

- `SkillLevelResult`
- `SkillLevelsResponse`
- `SkillLevelAssessmentSubmissionRequest`
- `SkillLevelAssessmentSubmissionResponse`
- `MutationSuccessResponse`

## Endpoints
| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/users/:userId/skill-levels` | - | `SkillLevelsResponse` |
| `POST` | `/users/:userId/skill-levels/assessments` | `SkillLevelAssessmentSubmissionRequest` | `SkillLevelAssessmentSubmissionResponse` |
| `DELETE` | `/users/:userId/skill-levels/:roadmapId` | - | `MutationSuccessResponse` |

## Пример ответа сервера
```json
{
  "roadmapId": "backend",
  "roadmapTitle": "Backend",
  "levelLabel": "Middle",
  "score": 2.14,
  "updatedAt": "2026-03-05T10:05:00.000Z",
  "assignedRoadmapLevel": "Intermediate"
}
```

## Что заменить при миграции
- Store `skillLevels.ts` должен синхронизироваться с backend вместо `user_skill_levels_v1`.
- Алгоритм расчета уровня можно оставить на backend как единый источник истины.
