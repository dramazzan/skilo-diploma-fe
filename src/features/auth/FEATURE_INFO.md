# Feature Contract: auth

## Цель
Контракт аутентификации и onboarding для перехода с mock/local state на реальный backend API.

## Модели (server contract)
Источник: `src/shared/api/types.ts` (+ целевой контракт в `src/shared/types/api-contract.ts`).

```ts
type LoginPayload = { email: string; password: string; role: "student" | "company" }
type RegisterPayload = {
  email: string
  password: string
  role: "student" | "company"
  country?: string
  city?: string
  university?: string
  companyName?: string
  bin?: string
  industry?: string
  contactPerson?: string
  phone?: string
  website?: string
}
type AuthResponse = {
  token: string
  user: {
    id: number
    email: string
    role: "student" | "company"
    firstLogin: boolean
    createdAt: string
    country: string
    city: string
    university: string
    companyProfile: CompanyProfile | null
  }
}
```

Целевой onboarding DTO (уже описан в `api-contract.ts`):
- `OnboardingSubmitRequest { interests: string[] }`
- `OnboardingSubmitResponse { user: AuthUser }`

## Endpoints
| Method | Path | Request | Response | Используется в FE |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | `LoginPayload` | `AuthResponse` | `authApi.login` |
| `POST` | `/auth/register` | `RegisterPayload` | `AuthResponse` | `authApi.register` |
| `PATCH` | `/users/:userId/onboarding` | `OnboardingSubmitRequest` | `OnboardingSubmitResponse` | пока локально через `setOnboardingDone` |

## Пример ответа сервера
```json
{
  "token": "jwt-token",
  "user": {
    "id": 101,
    "email": "student@example.com",
    "role": "student",
    "firstLogin": false,
    "createdAt": "2026-03-05T09:00:00.000Z",
    "country": "Kazakhstan",
    "city": "Almaty",
    "university": "Satbayev University",
    "companyProfile": null
  }
}
```

## Что заменить при миграции
- Убрать локальный onboarding-only state (`auth.setOnboardingDone`) и перевести на `PATCH /users/:userId/onboarding`.
- Хранить только `access/refresh` токены по серверной схеме (сейчас используется один `token`).
