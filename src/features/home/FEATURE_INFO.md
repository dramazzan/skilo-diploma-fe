# Feature Contract: home

## Цель
Главная страница сейчас презентационная и не использует backend-данные.

## Модели
- Нет обязательных request/response DTO для MVP.
- Для ошибок lazy-loading роутов используется общий формат `ApiErrorResponse` (из `src/shared/types/api-contract.ts`) на уровне system routes.

## Endpoints
В текущем состоянии: **нет прямых endpoint-ов**.

## Пример (если backend вернет ошибку при загрузке секций)
```json
{
  "message": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "details": { "section": "home-hero" }
}
```

## Что важно при миграции
- Если контент главной будет серверным, добавить отдельный `home.api.ts` и описать DTO здесь.
- Не смешивать UI-анимации и бизнес-данные: загрузка контента должна быть отдельным composable/store слоем.
