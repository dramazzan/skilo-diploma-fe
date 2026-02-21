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
  { id: "history-of-ai", roadmapId: "ai", title: "History of AI", description: "From symbolic AI to modern deep learning", level: "beginner" },
  { id: "data-preprocessing", roadmapId: "ai", title: "Data Preprocessing", description: "Cleaning, normalization, and feature prep", level: "beginner" },
  { id: "ml-intro", roadmapId: "ai", title: "Machine Learning Intro", description: "Core ML ideas and model workflow", level: "beginner" },
  { id: "model-evaluation", roadmapId: "ai", title: "Model Evaluation", description: "Metrics, validation, and generalization", level: "intermediate" },
  { id: "neural-networks", roadmapId: "ai", title: "Neural Networks", description: "Perceptron, layers, activation functions", level: "intermediate" },
  { id: "optimization-basics", roadmapId: "ai", title: "Optimization Basics", description: "Gradient descent and optimization tricks", level: "intermediate" },
  { id: "cnn", roadmapId: "ai", title: "Convolutional Neural Networks", description: "Image-focused deep learning architecture", level: "advanced" },
  { id: "transformers-basics", roadmapId: "ai", title: "Transformers Basics", description: "Attention architecture fundamentals", level: "advanced" },

  { id: "flexbox", roadmapId: "frontend", title: "Flexbox", description: "One-dimensional layouts with CSS", level: "beginner" },
  { id: "responsive-design", roadmapId: "frontend", title: "Responsive Design", description: "Adaptive UI for mobile and desktop", level: "beginner" },
  { id: "grid", roadmapId: "frontend", title: "CSS Grid", description: "Two-dimensional responsive layout system", level: "beginner" },
  { id: "css-architecture", roadmapId: "frontend", title: "CSS Architecture", description: "Scalable CSS organization patterns", level: "intermediate" },
  { id: "composition-api", roadmapId: "frontend", title: "Composition API", description: "State and logic composition in Vue 3", level: "intermediate" },
  { id: "vue-lifecycle", roadmapId: "frontend", title: "Vue Lifecycle", description: "Lifecycle hooks and rendering phases", level: "intermediate" },
  { id: "pinia", roadmapId: "frontend", title: "State Management with Pinia", description: "Centralized state for Vue applications", level: "intermediate" },
  { id: "vue-router-basics", roadmapId: "frontend", title: "Vue Router Basics", description: "Route config, params, and navigation", level: "intermediate" },

  { id: "express", roadmapId: "backend", title: "Express", description: "Build HTTP APIs with Express.js", level: "beginner" },
  { id: "rest-design", roadmapId: "backend", title: "REST Design", description: "Resource modeling and HTTP semantics", level: "intermediate" },
  { id: "auth", roadmapId: "backend", title: "Authentication", description: "Sessions, tokens, and route protection", level: "intermediate" },
  { id: "role-based-access", roadmapId: "backend", title: "Role-Based Access", description: "Permissions and role policies", level: "intermediate" },
  { id: "database-indexing", roadmapId: "backend", title: "Database Indexing", description: "Indexes and query optimization", level: "intermediate" },

  { id: "docker-basics", roadmapId: "devops", title: "Docker Basics", description: "Container fundamentals and workflows", level: "beginner" },
  { id: "docker-networking", roadmapId: "devops", title: "Docker Networking", description: "Container networks and service communication", level: "intermediate" },
  { id: "cicd-pipelines", roadmapId: "devops", title: "CI/CD Pipelines", description: "Build, test, and deploy automation", level: "intermediate" },
  { id: "monitoring-basics", roadmapId: "devops", title: "Monitoring Basics", description: "Metrics, logs, and alerts", level: "intermediate" },

  { id: "flutter", roadmapId: "mobile", title: "Flutter", description: "Cross-platform mobile development basics", level: "beginner" },
  { id: "dart-basics", roadmapId: "mobile", title: "Dart Basics", description: "Language basics for Flutter", level: "beginner" },
  { id: "state-management-mobile", roadmapId: "mobile", title: "State Management", description: "Managing reactive app state", level: "intermediate" },
  { id: "app-deployment", roadmapId: "mobile", title: "App Deployment", description: "Release process for app stores", level: "intermediate" }
]

export const mockTopicContent: TopicContent[] = mockRoadmap.map((topic) => ({
  topicId: topic.id,
  theory: `${topic.title} theory summary:\n\n${topic.description}.\n\nKey ideas:\n- Core concepts\n- Practical workflow\n- Common mistakes\n- Best practices`
}))

export const mockTests: TopicTest[] = mockRoadmap.map((topic) => ({
  topicId: topic.id,
  questions: [
    {
      id: `${topic.id}-q1`,
      question: `What is the main focus of ${topic.title}?`,
      options: [
        "Core concepts and practical usage",
        "Database migrations only",
        "UI color themes only",
        "Operating system internals only"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q2`,
      question: `Which approach is best when learning ${topic.title}?`,
      options: [
        "Study theory and then apply it in small projects",
        "Memorize terms without practice",
        "Skip fundamentals",
        "Ignore documentation"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q3`,
      question: `What usually indicates beginner-level understanding in ${topic.title}?`,
      options: [
        "Can explain basics and complete simple tasks",
        "Can redesign entire architecture alone",
        "Never read examples",
        "Avoids debugging completely"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q4`,
      question: `How do you validate progress in ${topic.title}?`,
      options: [
        "Use practical tasks and measurable outcomes",
        "Judge only by time spent",
        "Skip feedback and tests",
        "Only watch tutorials"
      ],
      correctAnswerIndex: 0
    },
    {
      id: `${topic.id}-q5`,
      question: `What is a good next step after finishing basics of ${topic.title}?`,
      options: [
        "Build a mini project and review weak points",
        "Stop learning immediately",
        "Delete all notes",
        "Avoid real examples"
      ],
      correctAnswerIndex: 0
    }
  ]
}))
