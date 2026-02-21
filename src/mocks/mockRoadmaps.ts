export type RoadmapLevel = "Beginner" | "Intermediate" | "Advanced"

export interface Roadmap {
  id: string
  title: string
  description: string
  level: RoadmapLevel
  recommended: boolean
}

export type TopicStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "locked"

export interface RoadmapNode {
  id: string
  title: string
  status: TopicStatus
  children?: RoadmapNode[]
}

export interface AssessmentOption {
  id: string
  label: string
  score: number
}

export interface AssessmentQuestion {
  id: string
  text: string
  options: AssessmentOption[]
}

export interface RoadmapAssessment {
  roadmapId: string
  title: string
  questions: AssessmentQuestion[]
}

export const mockRoadmaps: Roadmap[] = [
  {
    id: "ai",
    title: "Artificial Intelligence",
    description: "Complete AI engineering path",
    level: "Intermediate",
    recommended: true
  },
  {
    id: "frontend",
    title: "Frontend Development",
    description: "Modern UI engineering",
    level: "Beginner",
    recommended: true
  },
  {
    id: "backend",
    title: "Backend Development",
    description: "Server-side & APIs",
    level: "Intermediate",
    recommended: true
  },
  {
    id: "devops",
    title: "DevOps Engineering",
    description: "CI/CD, Docker, Cloud",
    level: "Advanced",
    recommended: false
  },
  {
    id: "mobile",
    title: "Mobile Development",
    description: "Flutter / React Native",
    level: "Beginner",
    recommended: false
  }
]

export const mockUserCollection: string[] = ["ai", "frontend"]

const defaultOptions: AssessmentOption[] = [
  { id: "opt_beginner", label: "Я только начинаю", score: 1 },
  { id: "opt_intermediate", label: "У меня есть практический опыт на реальных задачах", score: 2 },
  { id: "opt_advanced", label: "Я уверенно применяю это в продакшене", score: 3 }
]

export const mockRoadmapAssessments: Record<string, RoadmapAssessment> = {
  ai: {
    roadmapId: "ai",
    title: "AI assessment",
    questions: [
      { id: "ai_math", text: "How would you rate your math skills for ML?", options: defaultOptions },
      { id: "ai_models", text: "Do you have experience training models?", options: defaultOptions },
      { id: "ai_frameworks", text: "How confident are you with ML frameworks?", options: defaultOptions },
      { id: "ai_data", text: "How comfortable are you preparing and cleaning datasets?", options: defaultOptions },
      { id: "ai_metrics", text: "How well do you understand evaluation metrics (precision/recall/F1)?", options: defaultOptions },
      { id: "ai_deploy", text: "Have you deployed ML/AI models to real environments?", options: defaultOptions }
    ]
  },
  frontend: {
    roadmapId: "frontend",
    title: "Frontend assessment",
    questions: [
      { id: "fe_layout", text: "How confident are you with responsive layouts?", options: defaultOptions },
      { id: "fe_js", text: "What is your current JavaScript level?", options: defaultOptions },
      { id: "fe_framework", text: "Do you have experience with modern UI frameworks?", options: defaultOptions },
      { id: "fe_accessibility", text: "How often do you apply accessibility best practices?", options: defaultOptions },
      { id: "fe_state", text: "How confident are you with state management patterns?", options: defaultOptions },
      { id: "fe_perf", text: "How comfortable are you optimizing frontend performance?", options: defaultOptions }
    ]
  },
  backend: {
    roadmapId: "backend",
    title: "Backend assessment",
    questions: [
      { id: "be_api", text: "How confident are you designing REST APIs?", options: defaultOptions },
      { id: "be_db", text: "Do you have experience with SQL/NoSQL databases?", options: defaultOptions },
      { id: "be_auth", text: "How would you rate your experience with auth and security?", options: defaultOptions },
      { id: "be_scaling", text: "How comfortable are you with scaling backend services?", options: defaultOptions },
      { id: "be_cache", text: "Do you use caching strategies (Redis/CDN/in-memory)?", options: defaultOptions },
      { id: "be_observability", text: "How confident are you with logs, metrics, and tracing?", options: defaultOptions }
    ]
  },
  devops: {
    roadmapId: "devops",
    title: "DevOps assessment",
    questions: [
      { id: "devops_ci", text: "How familiar are you with CI/CD pipelines?", options: defaultOptions },
      { id: "devops_containers", text: "Do you have experience with Docker/Kubernetes?", options: defaultOptions },
      { id: "devops_cloud", text: "How confident are you with cloud providers?", options: defaultOptions },
      { id: "devops_iac", text: "How comfortable are you with Infrastructure as Code?", options: defaultOptions },
      { id: "devops_monitoring", text: "Do you set up monitoring and alerting in projects?", options: defaultOptions },
      { id: "devops_security", text: "How confident are you with DevSecOps practices?", options: defaultOptions }
    ]
  },
  mobile: {
    roadmapId: "mobile",
    title: "Mobile assessment",
    questions: [
      { id: "mobile_ui", text: "Do you have experience building mobile UIs?", options: defaultOptions },
      { id: "mobile_state", text: "How confident are you managing app state?", options: defaultOptions },
      { id: "mobile_release", text: "Do you have experience publishing apps to stores?", options: defaultOptions },
      { id: "mobile_arch", text: "How comfortable are you with mobile architecture patterns?", options: defaultOptions },
      { id: "mobile_perf", text: "How confident are you with mobile performance optimization?", options: defaultOptions },
      { id: "mobile_testing", text: "Do you write automated tests for mobile apps?", options: defaultOptions }
    ]
  }
}

export const mockRoadmapTrees: Record<string, RoadmapNode[]> = {
  ai: [
    {
      id: "ai-foundations",
      title: "AI Foundations",
      status: "completed",
      children: [
        {
          id: "ai-history-track",
          title: "Historical Context",
          status: "completed",
          children: [
            {
              id: "history-of-ai",
              title: "History of AI",
              status: "completed"
            },
            {
              id: "data-preprocessing",
              title: "Data Preprocessing",
              status: "in_progress"
            }
          ]
        },
        {
          id: "ai-ml-track",
          title: "Machine Learning Basics",
          status: "in_progress",
          children: [
            {
              id: "ml-intro",
              title: "Machine Learning Intro",
              status: "in_progress"
            },
            {
              id: "model-evaluation",
              title: "Model Evaluation",
              status: "not_started"
            }
          ]
        }
      ]
    },
    {
      id: "ai-deep-learning",
      title: "Deep Learning",
      status: "not_started",
      children: [
        {
          id: "ai-nn-track",
          title: "Neural Network Core",
          status: "not_started",
          children: [
            {
              id: "neural-networks",
              title: "Neural Networks",
              status: "not_started"
            },
            {
              id: "optimization-basics",
              title: "Optimization Basics",
              status: "locked"
            }
          ]
        },
        {
          id: "ai-cnn-track",
          title: "Computer Vision Path",
          status: "locked",
          children: [
            {
              id: "cnn",
              title: "CNN",
              status: "locked"
            },
            {
              id: "transformers-basics",
              title: "Transformers Basics",
              status: "locked"
            }
          ]
        }
      ]
    }
  ],

  frontend: [
    {
      id: "fe-layout-foundation",
      title: "HTML & CSS Foundation",
      status: "completed",
      children: [
        {
          id: "fe-flex-layout",
          title: "One-dimensional Layout",
          status: "completed",
          children: [
            { id: "flexbox", title: "Flexbox", status: "completed" },
            { id: "responsive-design", title: "Responsive Design", status: "in_progress" }
          ]
        },
        {
          id: "fe-grid-layout",
          title: "Two-dimensional Layout",
          status: "in_progress",
          children: [
            { id: "grid", title: "CSS Grid", status: "in_progress" },
            { id: "css-architecture", title: "CSS Architecture", status: "not_started" }
          ]
        }
      ]
    },
    {
      id: "fe-vue-foundation",
      title: "Vue 3",
      status: "not_started",
      children: [
        {
          id: "fe-comp-api",
          title: "Component Architecture",
          status: "not_started",
          children: [
            { id: "composition-api", title: "Composition API", status: "not_started" },
            { id: "vue-lifecycle", title: "Vue Lifecycle", status: "locked" }
          ]
        },
        {
          id: "fe-state-layer",
          title: "State Layer",
          status: "locked",
          children: [
            { id: "pinia", title: "State Management (Pinia)", status: "locked" },
            { id: "vue-router-basics", title: "Vue Router Basics", status: "locked" }
          ]
        }
      ]
    }
  ],

  backend: [
    {
      id: "be-node-path",
      title: "Node.js",
      status: "not_started",
      children: [
        {
          id: "be-api-layer",
          title: "API Layer",
          status: "not_started",
          children: [
            { id: "express", title: "Express", status: "not_started" },
            { id: "rest-design", title: "REST Design", status: "locked" }
          ]
        },
        {
          id: "be-security-layer",
          title: "Security Layer",
          status: "locked",
          children: [
            { id: "auth", title: "Authentication", status: "locked" },
            { id: "role-based-access", title: "Role-Based Access", status: "locked" }
          ]
        },
        {
          id: "be-data-layer",
          title: "Data Layer",
          status: "locked",
          children: [
            { id: "database-indexing", title: "Database Indexing", status: "locked" }
          ]
        }
      ]
    }
  ],

  devops: [
    {
      id: "devops-containers",
      title: "Containers",
      status: "not_started",
      children: [
        {
          id: "devops-docker-path",
          title: "Docker Fundamentals",
          status: "not_started",
          children: [
            { id: "docker-basics", title: "Docker Basics", status: "not_started" },
            { id: "docker-networking", title: "Docker Networking", status: "locked" }
          ]
        },
        {
          id: "devops-cicd-path",
          title: "Automation Path",
          status: "locked",
          children: [
            { id: "cicd-pipelines", title: "CI/CD Pipelines", status: "locked" },
            { id: "monitoring-basics", title: "Monitoring Basics", status: "locked" }
          ]
        }
      ]
    }
  ],

  mobile: [
    {
      id: "mobile-core",
      title: "Mobile Core",
      status: "not_started",
      children: [
        {
          id: "mobile-flutter-track",
          title: "Flutter Track",
          status: "not_started",
          children: [
            {
              id: "flutter",
              title: "Flutter",
              status: "not_started"
            },
            {
              id: "dart-basics",
              title: "Dart Basics",
              status: "locked"
            },
            {
              id: "state-management-mobile",
              title: "State Management",
              status: "locked"
            },
            {
              id: "app-deployment",
              title: "App Deployment",
              status: "locked"
            }
          ]
        }
      ]
    }
  ]
}
