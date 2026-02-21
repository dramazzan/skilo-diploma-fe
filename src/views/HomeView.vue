<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const navigate = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>Платформа обучения AI</h1>
      <p>Пошаговые дорожные карты для изучения AI и IT-направлений</p>

      <div class="hero-actions">
        <button @click="navigate('/roadmaps')" class="primary">
          Начать обучение
        </button>
        <button @click="navigate('/login')" class="secondary">
          Войти
        </button>
      </div>
    </section>

    <section class="features">
      <h2>Возможности платформы</h2>

      <div class="features-grid">
        <div class="feature-card" @click="navigate('/roadmaps')">
          <h3>Roadmap</h3>
          <p>Структурированный план обучения</p>
        </div>

        <div class="feature-card" @click="navigate('/profile')">
          <h3>Профиль</h3>
          <p>Отслеживайте свой прогресс</p>
        </div>

        <div class="feature-card">
          <h3>AI-рекомендации</h3>
          <p>Персональные рекомендации для обучения</p>
        </div>
      </div>
    </section>
  </div>
</template>
