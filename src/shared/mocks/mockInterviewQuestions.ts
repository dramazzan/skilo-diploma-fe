import { mockRoadmap } from "@/shared/mocks/mockRoadmap"
import type { InterviewQuestionItem } from "@/shared/types/api-contract"

const makeInterviewPack = (topicId: string, title: string): InterviewQuestionItem[] => [
  {
    id: `${topicId}-i1`,
    topicId,
    question: `Как бы вы объяснили тему «${title}» junior-разработчику?`,
    answer:
      `Начните с базовых понятий, затем покажите один практический сценарий и завершите типичными ошибками. Для темы «${title}» важно объяснить, когда это использовать и какие есть компромиссы.`
  },
  {
    id: `${topicId}-i2`,
    topicId,
    question: `Какие типичные ошибки встречаются в теме «${title}»?`,
    answer:
      `Частые проблемы: избыточно сложные решения, слабая наблюдаемость при отладке и пропуск проверки результата. Хороший ответ включает и примеры ошибок, и способы их предотвратить.`
  },
  {
    id: `${topicId}-i3`,
    topicId,
    question: `Как вы оцените готовность темы «${title}» к продакшену?`,
    answer:
      `Проверьте надежность, производительность под нагрузкой, наблюдаемость и стратегию отката. На собеседовании обычно ждут конкретные метрики и понятный план верификации.`
  }
]

export const mockInterviewQuestionsByTopic: Record<string, InterviewQuestionItem[]> = Object.fromEntries(
  mockRoadmap.map((topic) => [topic.id, makeInterviewPack(topic.id, topic.title)])
)
