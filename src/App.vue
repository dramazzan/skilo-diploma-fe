<template>
  <div class="app-shell">
    <header class="top-nav">
      <div class="top-nav-inner">
        <router-link to="/roadmaps" class="top-brand">Skilo</router-link>
        <nav class="top-nav-links">
          <router-link to="/roadmaps">Дорожные карты</router-link>
          <router-link to="/vacancies">Вакансии</router-link>
          <router-link to="/leaders">Лидеры</router-link>
          <router-link to="/profile">Профиль</router-link>
          <router-link to="/login">Вход</router-link>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
