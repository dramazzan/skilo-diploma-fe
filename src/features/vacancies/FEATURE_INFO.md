# Feature Contract: vacancies

## Цель
Контракт витрины вакансий и подготовки: детали вакансии, реальные задачи, лидерборд, отправка решения.

## Модели (server contract)
Источник: `src/shared/api/types.ts` и `src/shared/types/api-contract.ts`.

- `Vacancy`
- `VacancyTask`
- `VacancyTaskSubmissionPayload`
- `VacancyTaskSubmission`
- `VacancyTaskLeaderboardResponse`
- `CandidateWorkLeaderboardResponse`

## Endpoints
| Method | Path | Request | Response | FE API |
| --- | --- | --- | --- | --- |
| `GET` | `/vacancies` | - | `Vacancy[]` | `vacanciesApi.getVacancies` |
| `GET` | `/vacancies/:vacancyId` | - | `Vacancy \| null` | `vacanciesApi.getVacancyById` |
| `GET` | `/vacancies/:vacancyId/tasks` | - | `Array<{ task: VacancyTask; submission: VacancyTaskSubmission \| null }>` | `vacanciesApi.getVacancyRealTasks` |
| `GET` | `/vacancies/:vacancyId/tasks/leaderboard` | - | `VacancyTaskLeaderboardResponse` | `vacanciesApi.getVacancyTaskLeaderboard` |
| `POST` | `/vacancies/:vacancyId/tasks/:taskId/submission` | `VacancyTaskSubmissionPayload` | `VacancyTaskSubmission` | `vacanciesApi.submitVacancyTask` |
| `GET` | `/leaderboard/candidate-work` | - | `CandidateWorkLeaderboardResponse` | используется в shared service, пока не вынесен в feature API |

## Пример ответа сервера
```json
{
  "vacancyId": "vac-101",
  "taskId": "task-1",
  "userId": 101,
  "solutionUrl": "https://github.com/user/test-task",
  "comment": "Готово, прошу проверить",
  "status": "submitted",
  "submittedAt": "2026-03-05T10:30:00.000Z"
}
```

## Что заменить при миграции
- Сейчас `getVacancyById` в `vacancies.api.ts` типизирован как `Promise<Vacancy>`, а сервис может вернуть `null`; при backend лучше унифицировать до `Vacancy | null`.
- Логику AI-оценки и HR shortlist окончательно перенести на сервер.
