<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { api, type FriendProfile, type GlobalItMapResponse } from "@/services/api"
import { useAuthStore } from "@/store/auth"

const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const addEmail = ref("")
const addError = ref<string | null>(null)

const friends = ref<FriendProfile[]>([])
const suggestions = ref<FriendProfile[]>([])
const globalMap = ref<GlobalItMapResponse | null>(null)

const participants = computed(() => globalMap.value?.participants ?? [])
const roadmapRows = computed(() => globalMap.value?.roadmaps ?? [])

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const userId = authStore.user?.id ?? null

    const [friendsData, suggestionsData, mapData] = await Promise.all([
      api.getFriends(userId),
      api.getFriendSuggestions(userId),
      api.getGlobalItMap(userId)
    ])

    friends.value = friendsData
    suggestions.value = suggestionsData
    globalMap.value = mapData
  } catch {
    error.value = "Не удалось загрузить страницу друзей"
  } finally {
    loading.value = false
  }
}

const refreshMap = async () => {
  const userId = authStore.user?.id ?? null
  globalMap.value = await api.getGlobalItMap(userId)
}

const addFriend = async () => {
  addError.value = null
  const email = addEmail.value.trim()
  if (!email) return

  try {
    saving.value = true
    const userId = authStore.user?.id ?? null
    friends.value = await api.addFriendByEmail(userId, email)
    suggestions.value = await api.getFriendSuggestions(userId)
    await refreshMap()
    addEmail.value = ""
  } catch (err: any) {
    addError.value = err?.message ?? "Не удалось добавить друга"
  } finally {
    saving.value = false
  }
}

const addSuggestedFriend = async (email: string) => {
  addEmail.value = email
  await addFriend()
}

const removeFriend = async (friendUserId: number) => {
  try {
    saving.value = true
    const userId = authStore.user?.id ?? null
    friends.value = await api.removeFriend(userId, friendUserId)
    suggestions.value = await api.getFriendSuggestions(userId)
    await refreshMap()
  } finally {
    saving.value = false
  }
}

const getProgress = (participantId: number, roadmapId: string) => {
  const participant = participants.value.find((item) => item.userId === participantId)
  if (!participant) return 0
  return participant.roadmapProgress[roadmapId] ?? 0
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="friends-page">
    <header class="hero">
      <div>
        <p class="section-title">Социальный прогресс</p>
        <h1>Друзья</h1>
        <p class="hero-note">Добавляйте людей в сеть и наблюдайте общий рост на глобальной карте айтишника.</p>
      </div>
      <div class="hero-metrics">
        <div class="metric">
          <span>Друзья</span>
          <strong>{{ friends.length }}</strong>
        </div>
        <div class="metric">
          <span>Участники карты</span>
          <strong>{{ participants.length }}</strong>
        </div>
      </div>
    </header>

    <div v-if="loading" class="state">Загрузка...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else class="friends-layout">
      <aside class="network-panel">
        <section class="panel-block">
          <p class="section-title">Добавить друга</p>
          <div class="add-row">
            <input
              v-model="addEmail"
              type="email"
              placeholder="Введите email пользователя"
              :disabled="saving"
            />
            <button class="primary" :disabled="saving || !addEmail.trim()" @click="addFriend">
              {{ saving ? "Добавление..." : "Добавить" }}
            </button>
          </div>
          <p v-if="addError" class="error">{{ addError }}</p>
        </section>

        <section v-if="suggestions.length" class="panel-block">
          <p class="section-title">Рекомендации</p>
          <div class="chips">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.userId"
              type="button"
              class="chip"
              :disabled="saving"
              @click="addSuggestedFriend(suggestion.email)"
            >
              {{ suggestion.fullName }}
            </button>
          </div>
        </section>

        <section class="panel-block">
          <p class="section-title">Ваша сеть</p>
          <p v-if="!friends.length" class="muted">Пока нет друзей в списке.</p>
          <div v-else class="friends-list">
            <article v-for="friend in friends" :key="friend.userId" class="friend-card">
              <div class="friend-main">
                <span class="avatar">{{ friend.avatar }}</span>
                <div class="friend-copy">
                  <h3>{{ friend.fullName }}</h3>
                  <p>{{ friend.country }} · {{ friend.city }}</p>
                </div>
                <button class="secondary tiny" :disabled="saving" @click="removeFriend(friend.userId)">Удалить</button>
              </div>
              <div class="friend-meta">
                <span class="badge-pill">{{ friend.roadmapProgressPercent }}%</span>
                <span class="badge-pill">🏆 {{ friend.points }}</span>
              </div>
            </article>
          </div>
        </section>
      </aside>

      <section class="map-panel">
        <div class="map-panel-head">
          <p class="section-title">Глобальная карта</p>
          <p>Карта строится как дерево: общий корень и ветки участников с прогрессом по направлениям.</p>
        </div>

        <p v-if="participants.length <= 1" class="muted">
          Добавьте хотя бы одного друга, чтобы увидеть дерево сравнения.
        </p>

        <div v-else class="tree-scene">
          <div class="tree-root">
            <span class="root-dot" />
            <strong>Global IT Root</strong>
          </div>

          <div class="tree-trunk" />

          <div class="tree-canopy">
            <article
              v-for="participant in participants"
              :key="participant.userId"
              class="tree-branch"
              :class="{ me: participant.isCurrentUser }"
            >
              <div class="branch-link" />
              <div class="branch-head">
                <span class="avatar">{{ participant.avatar }}</span>
                <div class="branch-copy">
                  <h3>{{ participant.fullName }}</h3>
                  <div class="branch-badges">
                    <span class="badge-pill">{{ participant.overallProgressPercent }}%</span>
                    <span class="badge-pill">🏆 {{ participant.points }}</span>
                  </div>
                </div>
              </div>

              <ul class="leaf-list">
                <li
                  v-for="roadmap in roadmapRows"
                  :key="`${participant.userId}-${roadmap.roadmapId}`"
                  class="leaf-item"
                >
                  <div class="leaf-head">
                    <span class="leaf-title">{{ roadmap.title }}</span>
                    <strong>{{ getProgress(participant.userId, roadmap.roadmapId) }}%</strong>
                  </div>
                  <div class="mini-track">
                    <span class="mini-fill" :style="{ width: `${getProgress(participant.userId, roadmap.roadmapId)}%` }" />
                  </div>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.friends-page {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0a0a0a;
}

.hero {
  border: 1px solid #eee;
  border-radius: 14px;
  background: linear-gradient(165deg, #ffffff 0%, #f7f7f7 100%);
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.hero h1 {
  margin: 0 0 6px;
  font-size: 28px;
  letter-spacing: -0.03em;
}

.hero-note {
  margin: 0;
  color: #888;
  max-width: 620px;
}

.hero-metrics {
  display: flex;
  gap: 10px;
}

.metric {
  min-width: 130px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  padding: 10px;
}

.metric span {
  display: block;
  font-size: 12px;
  color: #999;
}

.metric strong {
  font-size: 24px;
  letter-spacing: -0.02em;
}

.friends-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 14px;
}

.network-panel,
.map-panel {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
}

.network-panel {
  display: grid;
  align-content: start;
  gap: 12px;
}

.panel-block {
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f9f9f9;
  padding: 12px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
}

.state {
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  padding: 24px;
}

.state.error {
  color: #0a0a0a;
  background: #f9f9f9;
}

.add-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.add-row input {
  height: 40px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: #0a0a0a;
}

.add-row input::placeholder {
  color: #999;
}

.add-row input:focus {
  outline: none;
  border-color: #999;
}

.primary,
.secondary,
.chip {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.primary {
  background: #0a0a0a;
  border-color: #0a0a0a;
  color: #fff;
}

.secondary {
  background: #fff;
  color: #0a0a0a;
}

.secondary.tiny {
  padding: 6px 10px;
  font-size: 12px;
}

.chip {
  border-radius: 100px;
  background: #fff;
  color: #0a0a0a;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
}

.primary:hover,
.secondary:hover,
.chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(10, 10, 10, 0.08);
}

.error {
  color: #0a0a0a;
  margin: 8px 0 0;
  font-size: 13px;
}

.muted {
  color: #999;
}

.suggestions {
  margin-top: 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.friend-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  padding: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.friend-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(10, 10, 10, 0.08);
}

.friend-main {
  display: flex;
  gap: 8px;
  align-items: center;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0a0a0a;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.friend-copy {
  min-width: 0;
  flex: 1;
}

.friend-copy h3 {
  margin: 0;
  font-size: 14px;
  color: #0a0a0a;
}

.friend-copy p {
  margin: 2px 0 0;
  color: #888;
  font-size: 12px;
}

.friend-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
  color: #888;
  font-size: 13px;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #eee;
  border-radius: 100px;
  padding: 4px 10px;
  background: #f5f5f5;
  color: #0a0a0a;
  font-size: 12px;
  font-weight: 600;
}

.map-panel-head {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.map-panel-head p {
  margin: 0;
  color: #888;
}

.tree-scene {
  position: relative;
  border: 1px solid #eee;
  border-radius: 12px;
  background: radial-gradient(circle at 50% -20%, #f5f5f5 0%, #fff 46%);
  padding: 14px 12px 12px;
}

.tree-root {
  margin: 0 auto;
  width: fit-content;
  border: 1px solid #eee;
  border-radius: 100px;
  background: #f5f5f5;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.root-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0a0a0a;
}

.tree-root strong {
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.tree-trunk {
  width: 2px;
  height: 24px;
  background: #eee;
  margin: 8px auto 10px;
}

.tree-canopy {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}

.tree-branch {
  position: relative;
  border: 1px solid #eee;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfbfb 100%);
  padding: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tree-branch.me {
  background: linear-gradient(180deg, #f5f5f5 0%, #fafafa 100%);
}

.tree-branch:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(10, 10, 10, 0.08);
}

.branch-link {
  position: absolute;
  top: -12px;
  left: 50%;
  width: 1px;
  height: 12px;
  background: #eee;
  transform: translateX(-50%);
}

.branch-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.branch-copy h3 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #0a0a0a;
}

.branch-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.leaf-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaf-item {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  padding: 8px;
}

.leaf-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.leaf-title {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mini-track {
  height: 8px;
  border-radius: 999px;
  background: #eee;
  overflow: hidden;
}

.mini-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #0a0a0a;
}

@media (max-width: 640px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero h1 {
    font-size: 24px;
  }

  .hero-metrics {
    width: 100%;
  }

  .metric {
    flex: 1;
    min-width: 0;
  }

  .friends-layout {
    grid-template-columns: 1fr;
  }

  .add-row {
    grid-template-columns: 1fr;
  }

  .tree-canopy {
    grid-template-columns: 1fr;
  }
}
</style>
