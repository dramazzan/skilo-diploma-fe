<template>
  <div class="app-shell">
    <header class="top-nav">
      <div class="top-nav-inner">
        <router-link to="/roadmaps" class="top-brand">Skilo</router-link>
        <nav class="top-nav-menu">
          <div class="nav-section">
            <p class="nav-section-title">Обучение</p>
            <div class="top-nav-links">
              <router-link to="/roadmaps">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM8 10h8M8 14h5" /></svg>
                <span>Дорожные карты</span>
              </router-link>
              <router-link to="/friends">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6" /></svg>
                <span>Друзья</span>
              </router-link>
            </div>
          </div>

          <div class="nav-section">
            <p class="nav-section-title">Карьера</p>
            <div class="top-nav-links">
              <router-link to="/vacancies">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18v13H3zM8 7V5h8v2M3 12h18" /></svg>
                <span>Вакансии</span>
              </router-link>
              <router-link to="/leaders">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v2h3v2a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V6h3zM12 13v4M9 21h6" /></svg>
                <span>Лидеры</span>
              </router-link>
            </div>
          </div>

          <div class="nav-section">
            <p class="nav-section-title">Аккаунт</p>
            <div class="top-nav-links">
              <router-link to="/profile">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></svg>
                <span>Профиль</span>
              </router-link>
              <router-link to="/login">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                <span>Вход</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
