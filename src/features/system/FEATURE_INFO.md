# Feature Contract: system

## Цель
Контракт системных ошибок и fallback-экранов (`404`, `service unavailable`).

## Модели
Источник: `src/shared/types/api-contract.ts`.

```ts
type ApiErrorResponse = {
  message: string
  code?: string
  details?: Record<string, string | number | boolean>
}
```

## Ошибки, которые должен поддерживать backend
| HTTP | code | Использование в FE |
| --- | --- | --- |
| `404` | `NOT_FOUND` | `NotFoundView` для неизвестного маршрута/ресурса |
| `503` | `SERVICE_UNAVAILABLE` | `ServiceUnavailableView` при проблемах загрузки/сервера |

## Пример ответа сервера
```json
{
  "message": "Resource not found",
  "code": "NOT_FOUND",
  "details": { "path": "/vacancies/unknown-id" }
}
```

## Что заменить при миграции
- В API-слое централизованно маппить `404/503` на системные экраны.
- Сохранять `from` route в query для корректного возврата пользователя.
