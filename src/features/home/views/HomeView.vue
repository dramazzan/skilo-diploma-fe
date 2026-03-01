<script setup lang="ts">
import { useRouter } from "vue-router"
import roadmapVisual from "@/assets/visual-roadmap.svg"
import interviewVisual from "@/assets/visual-interview.svg"
import communityVisual from "@/assets/visual-community.svg"
import AmbientMotionLayer from "@/shared/ui/AmbientMotionLayer.vue"

const router = useRouter()

const projectSlides = [
  {
    id: "roadmaps",
    title: "Маршрут от базы до уверенного уровня",
    caption: "Дорожные карты превращают хаотичное обучение в последовательные шаги.",
    image: roadmapVisual
  },
  {
    id: "practice",
    title: "Практика, интервью и проверка решений",
    caption: "Короткие циклы: теория, задачи, обратная связь и следующий шаг.",
    image: interviewVisual
  },
  {
    id: "community",
    title: "Среда обмена опытом",
    caption: "Разработчики и компании делятся историями, новостями и мнениями.",
    image: communityVisual
  }
]

const valueCards = [
  {
    title: "Персональный трек",
    text: "Выбираете направление, проходите оценку уровня и получаете понятную точку старта."
  },
  {
    title: "Измеримый прогресс",
    text: "Платформа показывает, где вы уже сильны и какие темы дают максимальный рост."
  },
  {
    title: "Подготовка к карьере",
    text: "Практические задания, интервью-вопросы и подтверждение навыков в едином процессе."
  }
]

const whyCards = [
  {
    title: "От обучения к результату",
    text: "Сфокусировано не на потреблении контента, а на готовности к реальным рабочим задачам."
  },
  {
    title: "Один контур развития",
    text: "Roadmaps, ежедневные задания, профиль, резюме и сообщество работают как связанная система."
  },
  {
    title: "Гибкий темп",
    text: "Можно двигаться маленькими шагами каждый день, не теряя целостной картины."
  },
  {
    title: "Понятная ценность",
    text: "Каждый этап объясняет, какой конкретный навык вы усиливаете и зачем он нужен на рынке."
  }
]

const stats = [
  { value: "24/7", label: "доступ к платформе" },
  { value: "AI", label: "поддержка и рекомендации" },
  { value: "IT", label: "фокус на востребованные роли" }
]

const navigate = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home">
    <section class="hero ambient-host">
      <AmbientMotionLayer mode="hero" edge-fade="wide" intensity="medium" />
      <span class="badge">О проекте Skillo</span>
      <h1>Skillo: платформа роста в <span class="accent">IT</span></h1>
      <p>Единая среда, где обучение, практика, оценка уровня и карьерный трек работают как один процесс.</p>

      <div class="hero-actions">
        <button class="primary" @click="navigate('/roadmaps')">
          Открыть дорожные карты
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <button class="secondary" @click="navigate('/community')">Перейти в сообщество</button>
      </div>
    </section>

    <section class="story-grid" aria-label="Визуальная история проекта">
      <article
        v-for="(slide, index) in projectSlides"
        :key="slide.id"
        class="story-card"
        :style="{ '--story-delay': `${index * 120}ms` }"
      >
        <img :src="slide.image" :alt="slide.title" loading="lazy" />
        <div class="story-copy">
          <h3>{{ slide.title }}</h3>
          <p>{{ slide.caption }}</p>
        </div>
      </article>
    </section>

    <section class="text-bridge">
      <p class="text-bridge-lead">Каждое направление связано с карьерной целью, а не просто с темами для изучения</p>
      <p class="text-bridge-sub">Так легче держать фокус и понимать, какой следующий шаг даст максимум пользы.</p>
    </section>

    <section class="values ambient-host">
      <AmbientMotionLayer mode="panel" edge-fade="soft" intensity="low" />
      <div class="values-head">
        <span>Что внутри проекта</span>
        <h2>Полный цикл развития специалиста</h2>
      </div>
      <div class="values-grid">
        <article v-for="item in valueCards" :key="item.title" class="value-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="about">
      <div class="about-copy ambient-host">
        <AmbientMotionLayer mode="soft" edge-fade="soft" intensity="low" />
        <span class="about-kicker">О платформе</span>
        <h2>Skillo сокращает путь от обучения к реальной работе</h2>
        <p>
          Проект объединяет дорожные карты, задания, интервью-подготовку и подтверждение навыков.
          Вы двигаетесь по прозрачному маршруту и видите результат каждого этапа.
        </p>
        <p>
          Главная идея: меньше хаоса, больше системного прогресса и уверенности в своем уровне.
        </p>
      </div>
      <div class="about-stats">
        <article v-for="item in stats" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
      </div>
    </section>

    <section class="why ambient-host">
      <AmbientMotionLayer mode="panel" edge-fade="soft" intensity="low" />
      <h2>Почему пользователи выбирают Skillo</h2>
      <div class="why-grid">
        <article v-for="item in whyCards" :key="item.title" class="why-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="text-bridge text-bridge--second">
      <p class="text-bridge-lead">Прогресс виден по шагам, поэтому проще удерживать темп и не терять мотивацию</p>
      <p class="text-bridge-sub">Даже короткие ежедневные сессии складываются в ощутимый рост навыков.</p>
    </section>

    <section class="cta ambient-host">
      <AmbientMotionLayer mode="cta" edge-fade="wide" intensity="medium" />
      <h2>Начните с определения уровня и выберите трек под свою цель</h2>
      <p>Платформа подскажет точку старта и поможет собрать следующий реалистичный шаг.</p>
      <div class="hero-actions">
        <button class="primary" @click="navigate('/skill-levels')">Определить уровень</button>
        <button class="secondary" @click="navigate('/roadmaps')">К дорожным картам</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero {
  border: 1px solid var(--border);
  border-radius: 16px;
  background:
    radial-gradient(420px 220px at 12% -8%, rgba(109, 152, 255, 0.16), transparent 72%),
    radial-gradient(400px 220px at 92% 0%, rgba(255, 142, 60, 0.15), transparent 70%),
    linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.badge {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 6px 14px;
  margin-bottom: 14px;
}

.hero h1 {
  margin: 0 0 10px;
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--text);
}

.hero h1 .accent {
  background: linear-gradient(120deg, var(--primary) 0%, #5c80ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  margin: 0;
  max-width: 60ch;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.hero-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero button {
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 11px;
}

.hero button.primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.story-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  padding: 8px;
  display: grid;
  gap: 10px;
  opacity: 0;
  transform: translateY(10px);
  animation: story-in 0.66s ease forwards;
  animation-delay: var(--story-delay, 0ms);
  transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
}

.story-card::after {
  content: "";
  position: absolute;
  inset: -42% 45% auto -45%;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.24) 0%, transparent 72%);
  opacity: 0;
  transition: opacity 0.24s ease;
  pointer-events: none;
}

.story-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  object-fit: cover;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  animation: story-float 6s ease-in-out infinite;
}

.story-card:hover {
  border-color: var(--soft-border);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.story-card:hover::after {
  opacity: 1;
}

.story-card:nth-child(2) img {
  animation-delay: 0.3s;
}

.story-card:nth-child(3) img {
  animation-delay: 0.6s;
}

.story-copy h3 {
  margin: 0 0 4px;
  color: var(--text);
  font-size: 16px;
  line-height: 1.3;
}

.story-copy p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.text-bridge {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 8px;
}

.text-bridge-lead {
  margin: 0;
  max-width: 34ch;
  font-size: clamp(24px, 3.6vw, 42px);
  line-height: 1.06;
  letter-spacing: -0.03em;
  font-weight: 700;
  color: color-mix(in srgb, var(--text) 80%, var(--primary) 20%);
}

.text-bridge-sub {
  margin: 0;
  max-width: 54ch;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.text-bridge--second .text-bridge-lead {
  color: color-mix(in srgb, var(--text) 78%, #5c80ef 22%);
}

.values {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface) 88%, transparent) 0%, var(--surface-soft) 100%);
  padding: 16px 14px;
  display: grid;
  gap: 14px;
}

.values-head {
  display: grid;
  gap: 8px;
  text-align: center;
}

.values-head span {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.values-head h2 {
  margin: 0;
  color: var(--text);
  font-size: 30px;
  line-height: 1.16;
  letter-spacing: -0.025em;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.value-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  padding: 16px;
  display: grid;
  gap: 8px;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.value-card::before {
  content: "";
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--text) 14%, transparent) 0%, transparent 85%);
  opacity: 0.65;
}

.value-card:hover {
  border-color: var(--soft-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.value-card h3 {
  margin: 0;
  color: var(--text);
  font-size: 17px;
}

.value-card p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.about {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
}

.about-copy {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  padding: 18px;
  display: grid;
  gap: 8px;
}

.about-kicker {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.about-copy h2 {
  margin: 0;
  color: var(--text);
  font-size: 28px;
  line-height: 1.16;
  letter-spacing: -0.024em;
}

.about-copy p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.about-stats {
  display: grid;
  gap: 10px;
}

.about-stats article {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  padding: 14px;
  display: grid;
  gap: 5px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.about-stats article:hover {
  border-color: var(--soft-border);
  box-shadow: var(--shadow-sm);
}

.about-stats strong {
  font-size: 24px;
  line-height: 1;
  color: var(--text);
}

.about-stats span {
  color: var(--muted);
  font-size: 13px;
}

.why {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface) 90%, transparent) 0%, var(--surface-soft) 100%);
  padding: 16px 14px;
  display: grid;
  gap: 12px;
}

.why h2 {
  margin: 0;
  text-align: center;
  color: var(--text);
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.why-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  padding: 14px;
  display: grid;
  gap: 7px;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.why-card::before {
  content: "";
  position: absolute;
  inset: auto -28% -58% auto;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 72%);
  opacity: 0;
  transition: opacity 0.24s ease;
  pointer-events: none;
}

.why-card:hover {
  border-color: var(--soft-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.why-card:hover::before {
  opacity: 1;
}

.why-card h3 {
  margin: 0;
  color: var(--text);
  font-size: 16px;
}

.why-card p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.cta {
  border: 1px solid var(--border);
  border-radius: 16px;
  background:
    radial-gradient(300px 180px at 90% 0%, rgba(255, 142, 60, 0.13), transparent 72%),
    linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%);
  padding: 22px 18px;
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 8px;
}

.cta h2 {
  margin: 0;
  max-width: 36ch;
  color: var(--text);
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.cta p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
  max-width: 56ch;
}

@keyframes story-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.01);
  }
}

@keyframes story-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .story-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .values-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .about {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .story-grid,
  .values-grid,
  .why-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    padding: 20px 16px;
  }

  .hero h1 {
    font-size: 34px;
  }

  .values-head h2,
  .why h2,
  .about-copy h2,
  .cta h2 {
    font-size: 24px;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .story-card,
  .story-card img {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
