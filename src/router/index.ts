import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", redirect: "/roadmaps" },
  { path: "/login", component: () => import("@/views/auth/LoginView.vue") },
  {
    path: "/register",
    component: () => import("@/views/auth/RegisterView.vue"),
  },
  {
    path: "/onboarding",
    component: () => import("@/views/OnboardingView.vue"),
  },
  { path: "/leaders", component: () => import("@/views/LeadersView.vue") },
  { path: "/company", component: () => import("@/views/CompanyCabinetView.vue") },
  { path: "/friends", component: () => import("@/views/FriendsView.vue") },
  { path: "/vacancies", component: () => import("@/views/VacanciesView.vue") },
  {
    path: "/vacancies/:id/preparation",
    name: "vacancy-preparation",
    component: () => import("@/views/VacancyPreparationView.vue"),
  },
  { path: "/profile", component: () => import("@/views/ProfileView.vue") },
  {
    path: "/roadmaps",
    name: "roadmaps",
    component: () => import("@/views/RoadmapsView.vue"),
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
