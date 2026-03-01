export interface RoadmapTopic {
  id: string
  roadmapId: string
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
}

export interface TopicContent {
  topicId: string
  theory: string
}

export interface TestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
}

export interface TopicTest {
  topicId: string
  questions: TestQuestion[]
}

export const mockRoadmap: RoadmapTopic[] = [
  { id: "history-of-ai", roadmapId: "ai", title: "История AI", description: "От символического AI к современному глубокому обучению", level: "beginner" },
  { id: "data-preprocessing", roadmapId: "ai", title: "Предобработка данных", description: "Очистка, нормализация и подготовка признаков", level: "beginner" },
  { id: "ml-intro", roadmapId: "ai", title: "Введение в машинное обучение", description: "Ключевые идеи ML и рабочий процесс с моделями", level: "beginner" },
  { id: "model-evaluation", roadmapId: "ai", title: "Оценка моделей", description: "Метрики, валидация и обобщающая способность", level: "intermediate" },
  { id: "neural-networks", roadmapId: "ai", title: "Нейронные сети", description: "Перцептрон, слои и функции активации", level: "intermediate" },
  { id: "optimization-basics", roadmapId: "ai", title: "Основы оптимизации", description: "Градиентный спуск и приемы оптимизации", level: "intermediate" },
  { id: "cnn", roadmapId: "ai", title: "Сверточные нейронные сети", description: "Архитектура глубокого обучения для изображений", level: "advanced" },
  { id: "transformers-basics", roadmapId: "ai", title: "Основы трансформеров", description: "Базовые принципы архитектуры attention", level: "advanced" },

  { id: "flexbox", roadmapId: "frontend", title: "Флексбокс", description: "Одномерные макеты с помощью CSS", level: "beginner" },
  { id: "responsive-design", roadmapId: "frontend", title: "Адаптивный дизайн", description: "Адаптивный интерфейс для мобильных и десктопа", level: "beginner" },
  { id: "grid", roadmapId: "frontend", title: "CSS Grid", description: "Двумерная система адаптивной верстки", level: "beginner" },
  { id: "css-architecture", roadmapId: "frontend", title: "Архитектура CSS", description: "Масштабируемые паттерны организации CSS", level: "intermediate" },
  { id: "composition-api", roadmapId: "frontend", title: "Composition API", description: "Композиция состояния и логики во Vue 3", level: "intermediate" },
  { id: "vue-lifecycle", roadmapId: "frontend", title: "Жизненный цикл Vue", description: "Хуки жизненного цикла и этапы рендера", level: "intermediate" },
  { id: "pinia", roadmapId: "frontend", title: "Управление состоянием с Pinia", description: "Централизованное состояние для приложений Vue", level: "intermediate" },
  { id: "vue-router-basics", roadmapId: "frontend", title: "Основы Vue Router", description: "Конфигурация маршрутов, параметры и навигация", level: "intermediate" },

  { id: "express", roadmapId: "backend", title: "Express", description: "Создание HTTP API с помощью Express.js", level: "beginner" },
  { id: "rest-design", roadmapId: "backend", title: "Проектирование REST API", description: "Моделирование ресурсов и семантика HTTP", level: "intermediate" },
  { id: "auth", roadmapId: "backend", title: "Аутентификация", description: "Сессии, токены и защита маршрутов", level: "intermediate" },
  { id: "role-based-access", roadmapId: "backend", title: "Ролевой доступ", description: "Разрешения и ролевые политики", level: "intermediate" },
  { id: "database-indexing", roadmapId: "backend", title: "Индексация баз данных", description: "Индексы и оптимизация запросов", level: "intermediate" },

  { id: "docker-basics", roadmapId: "devops", title: "Базовый Docker", description: "Основы контейнеров и рабочие процессы", level: "beginner" },
  { id: "docker-networking", roadmapId: "devops", title: "Сетевое взаимодействие в Docker", description: "Сети контейнеров и взаимодействие сервисов", level: "intermediate" },
  { id: "cicd-pipelines", roadmapId: "devops", title: "CI/CD пайплайны", description: "Автоматизация сборки, тестирования и деплоя", level: "intermediate" },
  { id: "monitoring-basics", roadmapId: "devops", title: "Основы мониторинга", description: "Метрики, логи и алерты", level: "intermediate" },

  { id: "flutter", roadmapId: "mobile", title: "Flutter", description: "Основы кроссплатформенной мобильной разработки", level: "beginner" },
  { id: "dart-basics", roadmapId: "mobile", title: "Основы Dart", description: "Базовый синтаксис языка для Flutter", level: "beginner" },
  { id: "state-management-mobile", roadmapId: "mobile", title: "Управление состоянием", description: "Управление реактивным состоянием приложения", level: "intermediate" },
  { id: "app-deployment", roadmapId: "mobile", title: "Публикация приложения", description: "Процесс релиза для магазинов приложений", level: "intermediate" }
]

export const mockTopicContent: TopicContent[] = mockRoadmap.map((topic) => ({
  topicId: topic.id,
  theory: `${topic.title} краткая теория:\n\n${topic.description}.\n\nКлючевые идеи:\n- Базовые концепции\n- Практический рабочий процесс\n- Типичные ошибки\n- Лучшие практики`
}))

export const mockTests: TopicTest[] = mockRoadmap.map((topic) => ({
  topicId: topic.id,
  questions: [
    {
      id: `${topic.id}-q1`,
      question: `В чем основной фокус темы ${topic.title}?`,
      options: [
        "Базовые концепции и практическое применение",
        "Только миграции базы данных",
        "Только цветовые темы UI",
        "Только внутреннее устройство ОС"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q2`,
      question: `Какой подход лучше при изучении темы ${topic.title}?`,
      options: [
        "Изучать теорию и применять ее в небольших проектах",
        "Запоминать термины без практики",
        "Пропускать основы",
        "Игнорировать документацию"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q3`,
      question: `Что обычно показывает базовое понимание темы ${topic.title}?`,
      options: [
        "Может объяснить основы и выполнять простые задачи",
        "Может в одиночку перепроектировать всю архитектуру",
        "Никогда не смотреть примеры",
        "Полностью избегает отладки"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q4`,
      question: `Как вы проверяете прогресс в теме ${topic.title}?`,
      options: [
        "Использовать практические задачи и измеримые результаты",
        "Оценивать только по затраченному времени",
        "Пропускать обратную связь и тесты",
        "Только смотреть туториалы"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q5`,
      question: `Какой следующий шаг после изучения основ темы ${topic.title}?`,
      options: [
        "Сделать мини-проект и разобрать слабые места",
        "Сразу прекратить обучение",
        "Удалить все заметки",
        "Избегать реальных примеров"
      ],
      correctAnswerIndex: 0
    }
  ]
}))
