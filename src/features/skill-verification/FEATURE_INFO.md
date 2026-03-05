# Feature Contract: skill-verification

## Цель
Контракт записи на верификацию навыков (online/offline), статусы, сертификаты.

## Модели (server contract)
Источник: `src/shared/types/api-contract.ts`.

- `VerificationSlot`
- `VerificationBooking`
- `VerificationSlotsQuery`
- `CreateVerificationBookingRequest`
- `VerificationSlotsResponse`
- `VerificationBookingsResponse`
- `MutationSuccessResponse`

## Endpoints
| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/skill-verification/slots` | `VerificationSlotsQuery` (query) | `VerificationSlotsResponse` |
| `GET` | `/users/:userId/skill-verification/bookings` | - | `VerificationBookingsResponse` |
| `POST` | `/users/:userId/skill-verification/bookings` | `CreateVerificationBookingRequest` | `VerificationBooking` |
| `PATCH` | `/users/:userId/skill-verification/bookings/:bookingId/complete` | - | `VerificationBooking` |
| `DELETE` | `/users/:userId/skill-verification/bookings/:bookingId` | - | `MutationSuccessResponse` |

## Пример ответа сервера
```json
{
  "id": "booking-1741162800",
  "slotId": "2026-03-07-online-12:00",
  "roadmapId": "frontend",
  "roadmapTitle": "Frontend",
  "mode": "online",
  "date": "2026-03-07",
  "time": "12:00",
  "dateTimeIso": "2026-03-07T12:00:00",
  "location": "Google Meet",
  "assessor": "Aigerim B.",
  "status": "scheduled",
  "bookedAt": "2026-03-05T10:20:00.000Z",
  "completedAt": null,
  "certificateId": null
}
```

## Что заменить при миграции
- Убрать `skill_verification_bookings_v1` localStorage.
- Слотам нужен серверный контроль seats/конкурентных бронирований.
