export interface VacancyQuestion {
  id: string
  question: string
  answer: string
}

export interface VacancyTestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
}

export interface VacancyPreparation {
  direction: string
  questions: VacancyQuestion[]
  test: VacancyTestQuestion[]
}

export interface VacancyTask {
  id: string
  title: string
  brief: string
  requirements: string[]
  deliverables: string[]
  estimatedHours: number
}

export interface VacancyItem {
  id: string
  company: string
  title: string
  level: "junior" | "middle" | "senior"
  location: string
  employment: "full-time" | "part-time" | "internship" | "remote"
  salaryRange: string
  tags: string[]
  summary: string
  preparation: VacancyPreparation
  realTasks: VacancyTask[]
}

export const mockVacancies: VacancyItem[] = [
  {
    id: "vac-frontend-junior-1",
    company: "Kaspi Tech",
    title: "Junior Frontend-разработчик (Vue)",
    level: "junior",
    location: "Almaty",
    employment: "full-time",
    salaryRange: "450 000 - 650 000 KZT",
    tags: ["Vue 3", "TypeScript", "REST API"],
    summary: "Разработка пользовательских интерфейсов, участие в доработке внутренних продуктов и UI-компонентов.",
    preparation: {
      direction: "Фронтенд / Vue",
      questions: [
        {
          id: "fq1",
          question: "В чем отличие `ref` и `reactive` в Vue 3?",
          answer: "`ref` удобен для примитивов и имеет `.value`, а `reactive` — для объектов и массивов с глубокой реактивностью."
        },
        {
          id: "fq2",
          question: "Когда использовать `computed`, а когда `watch`?",
          answer: "`computed` для производных значений, `watch` — для побочных эффектов и асинхронных реакций на изменение данных."
        },
        {
          id: "fq3",
          question: "Что такое optimistic update и зачем он нужен?",
          answer: "Это мгновенное обновление UI до ответа сервера, чтобы интерфейс казался быстрым. При ошибке нужен rollback."
        }
      ],
      test: [
        {
          id: "ft1",
          question: "Какой хук вызывается после монтирования компонента?",
          options: ["onMounted", "onCreated", "onRender", "onAttached"],
          correctAnswerIndex: 0
        },
        {
          id: "ft2",
          question: "Где в Composition API хранится состояние компонента?",
          options: ["В setup()", "В data()", "В methods()", "В render()"],
          correctAnswerIndex: 0
        },
        {
          id: "ft3",
          question: "Что лучше использовать для производного значения?",
          options: ["watch", "computed", "setTimeout", "defineProps"],
          correctAnswerIndex: 1
        }
      ]
    },
    realTasks: [
      {
        id: "task-fe-1",
        title: "Форма регистрации с валидацией",
        brief: "Реализуйте форму регистрации с клиентской валидацией и обработкой ошибок сервера.",
        requirements: [
          "Vue 3 Composition API",
          "TypeScript",
          "Валидация email/пароля",
          "Состояния loading/success/error"
        ],
        deliverables: [
          "Ссылка на репозиторий",
          "README с инструкцией запуска",
          "Короткое описание архитектуры формы"
        ],
        estimatedHours: 6
      },
      {
        id: "task-fe-2",
        title: "Таблица пользователей с фильтрами",
        brief: "Сделайте таблицу пользователей с поиском, фильтрами и пагинацией.",
        requirements: [
          "REST API integration (mock)",
          "Поиск по имени/email",
          "Пагинация",
          "Адаптивная верстка"
        ],
        deliverables: [
          "Demo страница",
          "Описание edge-cases",
          "Скриншоты мобильной версии"
        ],
        estimatedHours: 8
      }
    ]
  },
  {
    id: "vac-backend-middle-1",
    company: "Freedom Tech",
    title: "Middle Backend-разработчик (Node.js)",
    level: "middle",
    location: "Astana",
    employment: "remote",
    salaryRange: "900 000 - 1 400 000 KZT",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    summary: "Проектирование API, оптимизация запросов, работа с очередями и масштабирование серверной логики.",
    preparation: {
      direction: "Бэкенд / Node.js",
      questions: [
        {
          id: "bq1",
          question: "Как избежать N+1 проблем при работе с БД?",
          answer: "Использовать JOIN/батч-запросы, правильно строить запросы и ограничивать количество обращений в циклах."
        },
        {
          id: "bq2",
          question: "Зачем нужен Docker в backend-разработке?",
          answer: "Для воспроизводимой среды, одинаковых версий зависимостей и упрощения деплоя."
        },
        {
          id: "bq3",
          question: "Что важно при проектировании REST API?",
          answer: "Согласованные ресурсы, корректные HTTP-методы/коды, версия API, валидация и единый формат ошибок."
        }
      ],
      test: [
        {
          id: "bt1",
          question: "Что лучше хранить в JWT?",
          options: ["Пароль", "Минимальный набор claims", "Большие массивы данных", "SQL запрос"],
          correctAnswerIndex: 1
        },
        {
          id: "bt2",
          question: "Какой статус для успешного создания ресурса?",
          options: ["200", "201", "204", "302"],
          correctAnswerIndex: 1
        },
        {
          id: "bt3",
          question: "Что такое индекс в БД?",
          options: ["Таблица логов", "Структура ускорения поиска", "Реплика", "Триггер"],
          correctAnswerIndex: 1
        }
      ]
    },
    realTasks: [
      {
        id: "task-be-1",
        title: "CRUD API для задач",
        brief: "Создайте REST API для управления задачами с авторизацией и валидацией входных данных.",
        requirements: [
          "Node.js + Express/Fastify",
          "JWT auth",
          "PostgreSQL + миграции",
          "Покрытие базовыми тестами"
        ],
        deliverables: [
          "OpenAPI/Swagger",
          "Postman collection",
          "Инструкция по запуску в Docker"
        ],
        estimatedHours: 10
      },
      {
        id: "task-be-2",
        title: "Оптимизация медленного endpoint",
        brief: "Найдите и оптимизируйте bottleneck в endpoint получения аналитики.",
        requirements: [
          "Профилирование запросов",
          "Оптимизация SQL",
          "Кэширование (по желанию)"
        ],
        deliverables: [
          "Отчет до/после оптимизации",
          "Измерения latency",
          "Измененный код"
        ],
        estimatedHours: 7
      }
    ]
  },
  {
    id: "vac-data-intern-1",
    company: "Halyk Digital",
    title: "Стажер-аналитик данных",
    level: "junior",
    location: "Almaty",
    employment: "internship",
    salaryRange: "250 000 - 350 000 KZT",
    tags: ["SQL", "Python", "BI"],
    summary: "Подготовка отчетов, анализ бизнес-метрик, визуализация данных и помощь в проверке гипотез.",
    preparation: {
      direction: "Аналитика данных",
      questions: [
        {
          id: "dq1",
          question: "Чем отличается `INNER JOIN` от `LEFT JOIN`?",
          answer: "`INNER JOIN` оставляет только совпадающие строки, `LEFT JOIN` сохраняет все строки левой таблицы."
        },
        {
          id: "dq2",
          question: "Что такое конверсия и как её считать?",
          answer: "Конверсия — доля пользователей, совершивших целевое действие: `целевые / все * 100%`."
        },
        {
          id: "dq3",
          question: "Для чего нужна визуализация данных?",
          answer: "Чтобы быстрее видеть тренды, аномалии и объяснять выводы бизнесу."
        }
      ],
      test: [
        {
          id: "dt1",
          question: "Какой SQL оператор агрегирует данные?",
          options: ["GROUP BY", "ORDER BY", "LIMIT", "ALTER"],
          correctAnswerIndex: 0
        },
        {
          id: "dt2",
          question: "Что измеряет медиана?",
          options: ["Среднее значение", "Центральное значение", "Дисперсию", "Моду"],
          correctAnswerIndex: 1
        },
        {
          id: "dt3",
          question: "Какой инструмент чаще используют для BI-дашбордов?",
          options: ["Postman", "Figma", "Power BI/Tableau", "Docker"],
          correctAnswerIndex: 2
        }
      ]
    },
    realTasks: [
      {
        id: "task-da-1",
        title: "Анализ воронки регистрации",
        brief: "Постройте воронку регистрации и найдите шаг с максимальной потерей пользователей.",
        requirements: [
          "SQL запросы для метрик",
          "Расчет conversion rate",
          "Гипотеза и рекомендации"
        ],
        deliverables: [
          "SQL-скрипт",
          "Короткий аналитический отчет",
          "1-2 визуализации"
        ],
        estimatedHours: 5
      },
      {
        id: "task-da-2",
        title: "Дашборд продуктовых метрик",
        brief: "Подготовьте дашборд по ключевым KPI за последний месяц.",
        requirements: [
          "Выбор 4-6 ключевых метрик",
          "Визуализация динамики",
          "Краткие выводы"
        ],
        deliverables: [
          "Ссылка на BI/ноутбук",
          "Описание метрик",
          "Интерпретация результатов"
        ],
        estimatedHours: 6
      }
    ]
  }
]
