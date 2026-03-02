import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("@/features/home/views/HomeView.vue") },
  {
    path: "/auth",
    component: () => import("@/features/auth/views/AuthEntryView.vue"),
    meta: { layout: "auth", public: true }
  },
  {
    path: "/login",
    component: () => import("@/features/auth/views/LoginView.vue"),
    meta: { layout: "auth", public: true }
  },
  {
    path: "/register",
    component: () => import("@/features/auth/views/RegisterView.vue"),
    meta: { layout: "auth", public: true }
  },
  {
    path: "/onboarding",
    component: () => import("@/features/auth/views/OnboardingView.vue"),
    meta: { layout: "auth" }
  },
  { path: "/leaders", component: () => import("@/features/leaders/views/LeadersView.vue") },
  { path: "/company", component: () => import("@/features/company/views/CompanyCabinetView.vue") },
  { path: "/friends", component: () => import("@/features/friends/views/FriendsView.vue") },
  { path: "/community", component: () => import("@/features/community/views/CommunityHubView.vue") },
  { path: "/vacancies", component: () => import("@/features/vacancies/views/VacanciesView.vue") },
  {
    path: "/vacancies/:id/preparation",
    name: "vacancy-preparation",
    component: () => import("@/features/vacancies/views/VacancyPreparationView.vue"),
  },
  { path: "/profile", component: () => import("@/features/profile/views/ProfileView.vue") },
  {
    path: "/skill-verification",
    name: "skill-verification",
    component: () => import("@/features/skill-verification/views/SkillVerificationView.vue"),
  },
  {
    path: "/skill-levels",
    name: "skill-levels",
    component: () => import("@/features/skill-levels/views/SkillLevelAssessmentView.vue"),
  },
  {
    path: "/roadmaps",
    name: "roadmaps",
    component: () => import("@/features/roadmaps/views/RoadmapsView.vue"),
  },
  {
    path: "/daily-tasks",
    name: "daily-tasks",
    component: () => import("@/features/daily-tasks/views/DailyTasksView.vue"),
  },
  {
    path: "/roadmaps/:id/assessment",
    name: "roadmap-assessment",
    component: () => import("@/features/roadmaps/views/RoadmapAssessmentView.vue"),
  },
  {
    path: "/roadmaps/:id",
    name: "roadmap-detail",
    component: () => import("@/features/roadmaps/views/RoadmapDetailView.vue"),
  },
  {
    path: "/topics/:id/interview",
    name: "topic-interview",
    component: () => import("@/features/roadmaps/views/TopicInterviewView.vue"),
  },
  {
    path: "/topics/:id",
    name: "topic",
    component: () => import("@/features/roadmaps/views/TopicView.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: "/roadmaps" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const roleAwareAuthPaths = new Set(["/login", "/register"])
const allowedRoles = new Set(["student", "company"])

router.beforeEach((to) => {
  if (!roleAwareAuthPaths.has(to.path)) return true

  const role = typeof to.query.role === "string" ? to.query.role : ""
  if (allowedRoles.has(role)) return true

  return {
    path: "/auth",
    query: {
      next: to.path
    }
  }
})

export default router
