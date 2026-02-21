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
      <span class="badge">Откройте мир AI</span>
      <h1>Платформа обучения <span class="accent">AI</span></h1>
      <p>Пошаговые дорожные карты для изучения AI и IT-направлений</p>

      <div class="hero-actions">
        <button @click="navigate('/roadmaps')" class="primary">
          Начать обучение
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
          </div>
          <h3>Roadmap</h3>
          <p>Структурированный план обучения</p>
        </div>

        <div class="feature-card" @click="navigate('/profile')">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </div>
          <h3>Профиль</h3>
          <p>Отслеживайте свой прогресс</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <h3>AI-рекомендации</h3>
          <p>Персональные рекомендации для обучения</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #fafafa;
  color: #111;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 100px 24px 80px;
  max-width: 640px;
  margin: 0 auto;
}

.badge {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #0a0a0a;
  background: #f0f0f0;
  border: 1px solid #e5e5e5;
  padding: 6px 16px;
  border-radius: 100px;
  margin-bottom: 28px;
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
}

.hero h1 .accent {
  background: linear-gradient(135deg, #0a0a0a 0%, #555 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 17px;
  line-height: 1.6;
  color: #666;
  margin: 0 0 40px;
  max-width: 420px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

button {
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  padding: 12px 24px;
  transition: all 0.2s ease;
}

button.primary {
  background: #0a0a0a;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

button.primary:hover {
  background: #222;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button.secondary {
  background: #fff;
  color: #0a0a0a;
  border: 1px solid #e0e0e0;
}

button.secondary:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

/* Features */
.features {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

.features h2 {
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #999;
  text-align: center;
  margin: 0 0 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 28px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 18px;
  color: #333;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #111;
}

.feature-card p {
  font-size: 14px;
  line-height: 1.5;
  color: #888;
  margin: 0;
}

@media (max-width: 640px) {
  .hero {
    padding: 64px 20px 56px;
  }

  .hero h1 {
    font-size: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>