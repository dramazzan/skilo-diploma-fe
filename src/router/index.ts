import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("@/views/HomeView.vue") },
  {
    path: "/login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { layout: "auth", public: true }
  },
  {
    path: "/register",
    component: () => import("@/views/auth/RegisterView.vue"),
    meta: { layout: "auth", public: true }
  },
  {
    path: "/onboarding",
    component: () => import("@/views/OnboardingView.vue"),
    meta: { layout: "auth" }
  },
  { path: "/leaders", component: () => import("@/views/LeadersView.vue") },
  { path: "/company", component: () => import("@/views/CompanyCabinetView.vue") },
  { path: "/friends", component: () => import("@/views/FriendsView.vue") },
  { path: "/community", component: () => import("@/views/CommunityHubView.vue") },
  { path: "/vacancies", component: () => import("@/views/VacanciesView.vue") },
  {
    path: "/vacancies/:id/preparation",
    name: "vacancy-preparation",
    component: () => import("@/views/VacancyPreparationView.vue"),
  },
  { path: "/profile", component: () => import("@/views/ProfileView.vue") },
  {
    path: "/skill-verification",
    name: "skill-verification",
    component: () => import("@/views/SkillVerificationView.vue"),
  },
  {
    path: "/skill-levels",
    name: "skill-levels",
    component: () => import("@/views/SkillLevelAssessmentView.vue"),
  },
  {
    path: "/roadmaps",
    name: "roadmaps",
    component: () => import("@/views/RoadmapsView.vue"),
  },
  {
    path: "/daily-tasks",
    name: "daily-tasks",
    component: () => import("@/views/DailyTasksView.vue"),
  },
  {
    path: "/roadmaps/:id/assessment",
    name: "roadmap-assessment",
    component: () => import("@/views/RoadmapAssessmentView.vue"),
  },
  {
    path: "/roadmaps/:id",
    name: "roadmap-detail",
    component: () => import("@/views/RoadmapDetailView.vue"),
  },
  {
    path: "/topics/:id/interview",
    name: "topic-interview",
    component: () => import("@/views/TopicInterviewView.vue"),
  },
  {
    path: "/topics/:id",
    name: "topic",
    component: () => import("@/views/TopicView.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: "/roadmaps" },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
