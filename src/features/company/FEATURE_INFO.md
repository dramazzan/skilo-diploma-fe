# Feature Contract: company

## Цель
Контракт кабинета компании: вакансии, задачи, кандидаты, приглашения на интервью.

## Модели (server contract)
Источник: `src/shared/api/types.ts` и `src/shared/types/api-contract.ts`.

- `CompanyVacancyPayload`
- `CompanyVacancyTaskPayload`
- `Vacancy`
- `VacancyTask`
- `CompanyCandidate`
- `InterviewInvitePayload`
- `InterviewInviteResult`
- `MutationSuccessResponse { success: boolean }`

## Endpoints
| Method | Path | Request | Response | FE API |
| --- | --- | --- | --- | --- |
| `GET` | `/company/vacancies` | - | `Vacancy[]` | `companyApi.getCompanyVacancies` |
| `POST` | `/company/vacancies` | `CompanyVacancyPayload` | `Vacancy` | `companyApi.createCompanyVacancy` |
| `PUT` | `/company/vacancies/:vacancyId` | `CompanyVacancyPayload` | `Vacancy` | `companyApi.updateCompanyVacancy` |
| `DELETE` | `/company/vacancies/:vacancyId` | - | `MutationSuccessResponse` | `companyApi.deleteCompanyVacancy` |
| `POST` | `/company/vacancies/:vacancyId/tasks` | `CompanyVacancyTaskPayload` | `VacancyTask` | `companyApi.createCompanyVacancyTask` |
| `PUT` | `/company/vacancies/:vacancyId/tasks/:taskId` | `CompanyVacancyTaskPayload` | `VacancyTask` | `companyApi.updateCompanyVacancyTask` |
| `DELETE` | `/company/vacancies/:vacancyId/tasks/:taskId` | - | `MutationSuccessResponse` | `companyApi.deleteCompanyVacancyTask` |
| `GET` | `/company/candidates` | - | `CompanyCandidate[]` | `companyApi.getCompanyCandidates` |
| `POST` | `/company/candidates/:candidateId/interview-invite` | `InterviewInvitePayload` | `InterviewInviteResult` | `companyApi.sendInterviewInvite` |

## Пример ответа сервера
```json
{
  "id": "cand-1",
  "fullName": "Aruzhan K.",
  "email": "aruzhan@example.com",
  "vacancyId": "vac-101",
  "vacancyTitle": "Frontend Developer",
  "status": "invited",
  "inviteSentAt": "2026-03-05T10:15:00.000Z",
  "evaluation": {
    "tasksSubmitted": 2,
    "tasksPassed": 2,
    "tasksTotal": 2,
    "overallScore": 84,
    "workReadinessPercent": 88,
    "readyForWork": true,
    "tasks": [],
    "test": { "status": "passed", "score": 86, "correctAnswers": 18, "totalQuestions": 20 },
    "interview": { "status": "passed", "score": 82, "answered": 9, "totalQuestions": 10 }
  }
}
```

## Что заменить при миграции
- Логику `USE_MOCK`/`storage.ts` полностью убрать из прод-ветки.
- В `company.api.ts` добавить обработку `404/409/422` серверных ошибок по полям формы.
