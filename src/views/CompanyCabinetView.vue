<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import {
  api,
  type CandidateResultStatus,
  type CompanyCandidate,
  type CompanyVacancyPayload,
  type CompanyVacancyTaskPayload,
  type Vacancy
} from "@/services/api"

type CompanyTab = "publish" | "manage" | "candidates"

const activeTab = ref<CompanyTab>("publish")
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const vacancies = ref<Vacancy[]>([])
const candidates = ref<CompanyCandidate[]>([])

const publishForm = reactive({
  title: "",
  description: "",
  requirements: "",
  level: "junior" as Vacancy["level"],
  stack: "",
  location: "Алматы",
  employment: "full-time" as Vacancy["employment"],
  salaryRange: ""
})

const editVacancyId = ref<string | null>(null)
const editForm = reactive({
  title: "",
  description: "",
  requirements: "",
  level: "junior" as Vacancy["level"],
  stack: "",
  location: "",
  employment: "full-time" as Vacancy["employment"],
  salaryRange: ""
})

const taskDraftByVacancy = reactive<Record<string, CompanyVacancyTaskPayload & { requirementsText: string; deliverablesText: string }>>({})
const taskEdit = reactive<{
  vacancyId: string | null
  taskId: string | null
  title: string
  brief: string
  requirementsText: string
  deliverablesText: string
  estimatedHours: number
}>({
  vacancyId: null,
  taskId: null,
  title: "",
  brief: "",
  requirementsText: "",
  deliverablesText: "",
  estimatedHours: 4
})

const inviteCandidateId = ref<string | null>(null)
const inviteForm = reactive({
  subject: "",
  message: ""
})
const selectedCandidate = ref<CompanyCandidate | null>(null)

const toList = (value: string) =>
  value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean)

const toVacancyPayload = (form: typeof publishForm): CompanyVacancyPayload => ({
  title: form.title.trim(),
  description: form.description.trim(),
  requirements: toList(form.requirements),
  level: form.level,
  stack: toList(form.stack),
  location: form.location.trim(),
  employment: form.employment,
  salaryRange: form.salaryRange.trim()
})

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const [vacancyList, candidateList] = await Promise.all([
      api.getCompanyVacancies(),
      api.getCompanyCandidates()
    ])
    vacancies.value = vacancyList
    candidates.value = candidateList
  } catch {
    error.value = "Не удалось загрузить кабинет компании"
  } finally {
    loading.value = false
  }
}

const clearMessages = () => {
  error.value = null
  success.value = null
}

const createVacancy = async () => {
  clearMessages()
  try {
    actionLoading.value = true
    await api.createCompanyVacancy(toVacancyPayload(publishForm))
    success.value = "Вакансия опубликована"
    Object.assign(publishForm, {
      title: "",
      description: "",
      requirements: "",
      level: "junior",
      stack: "",
      location: "Алматы",
      employment: "full-time",
      salaryRange: ""
    })
    await loadData()
    activeTab.value = "manage"
  } catch {
    error.value = "Не удалось опубликовать вакансию"
  } finally {
    actionLoading.value = false
  }
}

const startEditVacancy = (vacancy: Vacancy) => {
  editVacancyId.value = vacancy.id
  Object.assign(editForm, {
    title: vacancy.title,
    description: vacancy.summary,
    requirements: vacancy.realTasks[0]?.requirements.join("\n") ?? "",
    level: vacancy.level,
    stack: vacancy.tags.join(", "),
    location: vacancy.location,
    employment: vacancy.employment,
    salaryRange: vacancy.salaryRange
  })
}

const cancelEditVacancy = () => {
  editVacancyId.value = null
}

const saveVacancy = async (vacancyId: string) => {
  clearMessages()
  try {
    actionLoading.value = true
    await api.updateCompanyVacancy(vacancyId, toVacancyPayload(editForm))
    success.value = "Вакансия обновлена"
    editVacancyId.value = null
    await loadData()
  } catch {
    error.value = "Не удалось обновить вакансию"
  } finally {
    actionLoading.value = false
  }
}

const removeVacancy = async (vacancyId: string) => {
  clearMessages()
  try {
    actionLoading.value = true
    await api.deleteCompanyVacancy(vacancyId)
    success.value = "Вакансия удалена"
    await loadData()
  } catch {
    error.value = "Не удалось удалить вакансию"
  } finally {
    actionLoading.value = false
  }
}

const getTaskDraft = (vacancyId: string) => {
  if (!taskDraftByVacancy[vacancyId]) {
    taskDraftByVacancy[vacancyId] = {
      title: "",
      brief: "",
      requirements: [],
      deliverables: [],
      estimatedHours: 4,
      requirementsText: "",
      deliverablesText: ""
    }
  }
  return taskDraftByVacancy[vacancyId]
}

const addTask = async (vacancyId: string) => {
  clearMessages()
  const draft = getTaskDraft(vacancyId)
  if (!draft.title.trim()) return

  try {
    actionLoading.value = true
    await api.createCompanyVacancyTask(vacancyId, {
      title: draft.title.trim(),
      brief: draft.brief.trim(),
      requirements: toList(draft.requirementsText),
      deliverables: toList(draft.deliverablesText),
      estimatedHours: Number(draft.estimatedHours) || 1
    })
    taskDraftByVacancy[vacancyId] = {
      title: "",
      brief: "",
      requirements: [],
      deliverables: [],
      estimatedHours: 4,
      requirementsText: "",
      deliverablesText: ""
    }
    success.value = "Тестовое задание добавлено"
    await loadData()
  } catch {
    error.value = "Не удалось добавить тестовое задание"
  } finally {
    actionLoading.value = false
  }
}

const startEditTask = (vacancyId: string, task: Vacancy["realTasks"][number]) => {
  Object.assign(taskEdit, {
    vacancyId,
    taskId: task.id,
    title: task.title,
    brief: task.brief,
    requirementsText: task.requirements.join("\n"),
    deliverablesText: task.deliverables.join("\n"),
    estimatedHours: task.estimatedHours
  })
}

const cancelEditTask = () => {
  Object.assign(taskEdit, {
    vacancyId: null,
    taskId: null,
    title: "",
    brief: "",
    requirementsText: "",
    deliverablesText: "",
    estimatedHours: 4
  })
}

const saveTask = async () => {
  if (!taskEdit.vacancyId || !taskEdit.taskId) return
  clearMessages()
  try {
    actionLoading.value = true
    await api.updateCompanyVacancyTask(taskEdit.vacancyId, taskEdit.taskId, {
      title: taskEdit.title.trim(),
      brief: taskEdit.brief.trim(),
      requirements: toList(taskEdit.requirementsText),
      deliverables: toList(taskEdit.deliverablesText),
      estimatedHours: Number(taskEdit.estimatedHours) || 1
    })
    success.value = "Тестовое задание обновлено"
    cancelEditTask()
    await loadData()
  } catch {
    error.value = "Не удалось обновить тестовое задание"
  } finally {
    actionLoading.value = false
  }
}

const removeTask = async (vacancyId: string, taskId: string) => {
  clearMessages()
  try {
    actionLoading.value = true
    await api.deleteCompanyVacancyTask(vacancyId, taskId)
    success.value = "Тестовое задание удалено"
    await loadData()
  } catch {
    error.value = "Не удалось удалить тестовое задание"
  } finally {
    actionLoading.value = false
  }
}

const openInviteForm = (candidate: CompanyCandidate) => {
  selectedCandidate.value = null
  inviteCandidateId.value = candidate.id
  inviteForm.subject = `Приглашение на собеседование — ${candidate.vacancyTitle}`
  inviteForm.message =
    `Здравствуйте, ${candidate.fullName}!\n\n` +
    `Мы рассмотрели ваш отклик по вакансии «${candidate.vacancyTitle}» и хотим пригласить вас на собеседование.\n` +
    "Пожалуйста, ответьте на это письмо для согласования времени."
}

const openCandidateDetails = (candidate: CompanyCandidate) => {
  selectedCandidate.value = candidate
}

const closeCandidateDetails = () => {
  selectedCandidate.value = null
}

const candidateStatusLabel: Record<CompanyCandidate["status"], string> = {
  new: "Новый",
  reviewed: "Просмотрен",
  invited: "Приглашен"
}

const resultStatusLabel: Record<CandidateResultStatus, string> = {
  passed: "Сдан",
  failed: "Не сдан",
  not_submitted: "Не сдан"
}

const levelLabel: Record<CompanyCandidate["experienceLevel"], string> = {
  intern: "Intern",
  junior: "Junior",
  middle: "Middle"
}

const sendInvite = async (candidateId: string) => {
  clearMessages()
  try {
    actionLoading.value = true
    const result = await api.sendInterviewInvite(candidateId, {
      subject: inviteForm.subject,
      message: inviteForm.message
    })
    if (result) {
      success.value = `Письмо отправлено на ${result.sentTo}`
      inviteCandidateId.value = null
      inviteForm.subject = ""
      inviteForm.message = ""
      await loadData()
    }
  } catch {
    error.value = "Не удалось отправить приглашение"
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="company-page">
    <h1>Кабинет компании</h1>
    <p class="subtitle">Публикация вакансий, управление тестовыми заданиями и работа с кандидатами.</p>

    <div class="tabs">
      <button type="button" :class="{ active: activeTab === 'publish' }" @click="activeTab = 'publish'">Публикация вакансий</button>
      <button type="button" :class="{ active: activeTab === 'manage' }" @click="activeTab = 'manage'">Управление вакансиями</button>
      <button type="button" :class="{ active: activeTab === 'candidates' }" @click="activeTab = 'candidates'">Кандидаты</button>
    </div>

    <p v-if="error" class="status error">{{ error }}</p>
    <p v-if="success" class="status success">{{ success }}</p>

    <div v-if="loading" class="state">Загрузка...</div>

    <section v-else-if="activeTab === 'publish'" class="card">
      <h2>Новая вакансия</h2>
      <div class="form-grid">
        <label>Название<input v-model="publishForm.title" type="text" /></label>
        <label>Уровень
          <select v-model="publishForm.level">
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
          </select>
        </label>
        <label>Локация<input v-model="publishForm.location" type="text" /></label>
        <label>Формат занятости
          <select v-model="publishForm.employment">
            <option value="full-time">Полная занятость</option>
            <option value="part-time">Частичная занятость</option>
            <option value="internship">Стажировка</option>
            <option value="remote">Удаленно</option>
          </select>
        </label>
        <label>Зарплатная вилка<input v-model="publishForm.salaryRange" type="text" placeholder="Например: 700 000 - 900 000 KZT" /></label>
        <label>Стек технологий (через запятую)<input v-model="publishForm.stack" type="text" placeholder="Vue, TypeScript, REST API" /></label>
      </div>
      <label>Описание<textarea v-model="publishForm.description" rows="4" /></label>
      <label>Требования (каждый пункт с новой строки)<textarea v-model="publishForm.requirements" rows="5" /></label>
      <button class="primary" :disabled="actionLoading" @click="createVacancy">Опубликовать вакансию</button>
    </section>

    <section v-else-if="activeTab === 'manage'" class="card">
      <h2>Ваши вакансии</h2>
      <p v-if="!vacancies.length" class="muted">Пока нет опубликованных вакансий.</p>

      <div v-for="vacancy in vacancies" :key="vacancy.id" class="vacancy-item">
        <div class="vacancy-head">
          <div>
            <h3>{{ vacancy.title }}</h3>
            <p>{{ vacancy.location }} · {{ vacancy.level }}</p>
          </div>
          <div class="actions">
            <button class="secondary" @click="startEditVacancy(vacancy)">Редактировать</button>
            <button class="secondary" @click="removeVacancy(vacancy.id)">Удалить</button>
          </div>
        </div>

        <p class="vacancy-summary">{{ vacancy.summary }}</p>
        <div class="tags">
          <span v-for="tag in vacancy.tags" :key="tag">{{ tag }}</span>
        </div>

        <div v-if="editVacancyId === vacancy.id" class="nested-form">
          <h4>Редактирование вакансии</h4>
          <div class="form-grid">
            <label>Название<input v-model="editForm.title" type="text" /></label>
            <label>Уровень
              <select v-model="editForm.level">
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
              </select>
            </label>
            <label>Локация<input v-model="editForm.location" type="text" /></label>
            <label>Формат занятости
              <select v-model="editForm.employment">
                <option value="full-time">Полная занятость</option>
                <option value="part-time">Частичная занятость</option>
                <option value="internship">Стажировка</option>
                <option value="remote">Удаленно</option>
              </select>
            </label>
            <label>Зарплата<input v-model="editForm.salaryRange" type="text" /></label>
            <label>Стек<input v-model="editForm.stack" type="text" /></label>
          </div>
          <label>Описание<textarea v-model="editForm.description" rows="3" /></label>
          <div class="actions">
            <button class="primary" :disabled="actionLoading" @click="saveVacancy(vacancy.id)">Сохранить изменения</button>
            <button class="secondary" @click="cancelEditVacancy">Отмена</button>
          </div>
        </div>

        <div class="tasks-block">
          <h4>Тестовые задания</h4>
          <p v-if="!vacancy.realTasks.length" class="muted">Заданий пока нет.</p>

          <article v-for="task in vacancy.realTasks" :key="task.id" class="task-item">
            <div class="task-head">
              <strong>{{ task.title }}</strong>
              <span>{{ task.estimatedHours }} ч.</span>
            </div>
            <p>{{ task.brief }}</p>
            <div class="actions">
              <button class="secondary" @click="startEditTask(vacancy.id, task)">Редактировать задачу</button>
              <button class="secondary" @click="removeTask(vacancy.id, task.id)">Удалить задачу</button>
            </div>
          </article>

          <div class="nested-form">
            <h4>Добавить задание</h4>
            <label>Название<input v-model="getTaskDraft(vacancy.id).title" type="text" /></label>
            <label>Описание<textarea v-model="getTaskDraft(vacancy.id).brief" rows="2" /></label>
            <label>Требования<textarea v-model="getTaskDraft(vacancy.id).requirementsText" rows="3" /></label>
            <label>Что сдаёт кандидат<textarea v-model="getTaskDraft(vacancy.id).deliverablesText" rows="2" /></label>
            <label>Часы<input v-model.number="getTaskDraft(vacancy.id).estimatedHours" type="number" min="1" /></label>
            <button class="primary" :disabled="actionLoading" @click="addTask(vacancy.id)">Добавить задание</button>
          </div>
        </div>
      </div>

      <div v-if="taskEdit.vacancyId && taskEdit.taskId" class="modal">
        <div class="modal-content">
          <h3>Редактирование задания</h3>
          <label>Название<input v-model="taskEdit.title" type="text" /></label>
          <label>Описание<textarea v-model="taskEdit.brief" rows="3" /></label>
          <label>Требования<textarea v-model="taskEdit.requirementsText" rows="3" /></label>
          <label>Что сдаёт кандидат<textarea v-model="taskEdit.deliverablesText" rows="2" /></label>
          <label>Часы<input v-model.number="taskEdit.estimatedHours" type="number" min="1" /></label>
          <div class="actions">
            <button class="primary" :disabled="actionLoading" @click="saveTask">Сохранить</button>
            <button class="secondary" @click="cancelEditTask">Отмена</button>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="card">
      <h2>Кандидаты</h2>
      <p v-if="!candidates.length" class="muted">Пока нет откликов.</p>

      <article
        v-for="candidate in candidates"
        :key="candidate.id"
        class="candidate-item clickable"
        @click="openCandidateDetails(candidate)"
      >
        <div class="candidate-top">
          <div class="candidate-profile">
            <span class="avatar">{{ candidate.avatar }}</span>
            <div>
              <h3>{{ candidate.fullName }}</h3>
              <p>{{ candidate.email }}</p>
              <p>Вакансия: {{ candidate.vacancyTitle }}</p>
            </div>
          </div>
          <div class="candidate-meta">
            <span class="tag">{{ candidateStatusLabel[candidate.status] }}</span>
            <span class="tag">{{ levelLabel[candidate.experienceLevel] }}</span>
            <span class="tag readiness" :class="{ ok: candidate.evaluation.readyForWork }">
              {{ candidate.evaluation.readyForWork ? "Готов к работе" : "Требуется доработка" }}
            </span>
            <span v-if="typeof candidate.evaluation.overallScore === 'number'" class="tag score">
              Итог: {{ candidate.evaluation.overallScore }}%
            </span>
            <span class="tag score">Готовность: {{ candidate.evaluation.workReadinessPercent }}%</span>
          </div>
        </div>

        <div class="candidate-results">
          <span class="result-pill">Задачи: {{ candidate.evaluation.tasksPassed }}/{{ candidate.evaluation.tasksTotal }} сдано</span>
          <span class="result-pill" :class="`result-${candidate.evaluation.test.status}`">
            Тест: {{ resultStatusLabel[candidate.evaluation.test.status] }}
          </span>
          <span class="result-pill" :class="`result-${candidate.evaluation.interview.status}`">
            Вопросы: {{ resultStatusLabel[candidate.evaluation.interview.status] }}
          </span>
        </div>

        <div class="actions">
          <button class="secondary" @click.stop="openCandidateDetails(candidate)">Подробнее</button>
          <button class="primary" @click.stop="openInviteForm(candidate)">Пригласить на собеседование</button>
        </div>

        <p v-if="candidate.inviteSentAt" class="muted">
          Приглашение отправлено: {{ new Date(candidate.inviteSentAt).toLocaleString() }}
        </p>
      </article>

      <div v-if="inviteCandidateId" class="modal">
        <div class="modal-content">
          <h3>Отправить приглашение</h3>
          <label>Тема<input v-model="inviteForm.subject" type="text" /></label>
          <label>Сообщение<textarea v-model="inviteForm.message" rows="6" /></label>
          <div class="actions">
            <button class="primary" :disabled="actionLoading" @click="sendInvite(inviteCandidateId)">Отправить на email</button>
            <button class="secondary" @click="inviteCandidateId = null">Отмена</button>
          </div>
        </div>
      </div>

      <div v-if="selectedCandidate" class="modal" @click.self="closeCandidateDetails">
        <div class="modal-content candidate-modal">
          <h3>{{ selectedCandidate.fullName }}</h3>
          <p class="muted">{{ selectedCandidate.about }}</p>
          <div class="candidate-grid">
            <p><strong>Email:</strong> {{ selectedCandidate.email }}</p>
            <p><strong>Телефон:</strong> {{ selectedCandidate.phone }}</p>
            <p><strong>Страна:</strong> {{ selectedCandidate.country }}</p>
            <p><strong>Город:</strong> {{ selectedCandidate.city }}</p>
            <p><strong>Университет:</strong> {{ selectedCandidate.university }}</p>
            <p><strong>Уровень:</strong> {{ levelLabel[selectedCandidate.experienceLevel] }}</p>
          </div>
          <div class="tags">
            <span v-for="skill in selectedCandidate.skills" :key="skill">{{ skill }}</span>
          </div>

          <div class="result-block">
            <h4>HR-оценка</h4>
            <p>
              <strong>Статус:</strong>
              <span class="result-pill" :class="selectedCandidate.evaluation.readyForWork ? 'result-passed' : 'result-failed'">
                {{ selectedCandidate.evaluation.readyForWork ? "Готов к работе" : "Пока не готов" }}
              </span>
            </p>
            <p><strong>Процент готовности:</strong> {{ selectedCandidate.evaluation.workReadinessPercent }}%</p>
          </div>

          <div class="result-block">
            <h4>Результаты по задачам</h4>
            <p class="muted">Сдано: {{ selectedCandidate.evaluation.tasksPassed }} / {{ selectedCandidate.evaluation.tasksTotal }}</p>
            <div class="task-results">
              <div v-for="task in selectedCandidate.evaluation.tasks" :key="task.taskId" class="task-result-item">
                <span>{{ task.taskTitle }}</span>
                <span :class="`result-pill result-${task.status}`">
                  {{ resultStatusLabel[task.status] }}
                  <template v-if="typeof task.score === 'number'"> · {{ task.score }}%</template>
                </span>
              </div>
            </div>
          </div>

          <div class="result-block">
            <h4>Тест и вопросы</h4>
            <p>
              <strong>Тест:</strong>
              <span :class="`result-pill result-${selectedCandidate.evaluation.test.status}`">
                {{ resultStatusLabel[selectedCandidate.evaluation.test.status] }}
              </span>
              <span v-if="typeof selectedCandidate.evaluation.test.score === 'number'" class="muted">
                {{ selectedCandidate.evaluation.test.correctAnswers }}/{{ selectedCandidate.evaluation.test.totalQuestions }} · {{ selectedCandidate.evaluation.test.score }}%
              </span>
            </p>
            <p>
              <strong>Вопросы:</strong>
              <span :class="`result-pill result-${selectedCandidate.evaluation.interview.status}`">
                {{ resultStatusLabel[selectedCandidate.evaluation.interview.status] }}
              </span>
              <span v-if="typeof selectedCandidate.evaluation.interview.score === 'number'" class="muted">
                {{ selectedCandidate.evaluation.interview.answered }}/{{ selectedCandidate.evaluation.interview.totalQuestions }} · {{ selectedCandidate.evaluation.interview.score }}%
              </span>
            </p>
          </div>

          <div class="result-block">
            <h4>Профили</h4>
            <p><strong>Portfolio:</strong> {{ selectedCandidate.portfolioUrl || "Не указан" }}</p>
            <p><strong>GitHub:</strong> {{ selectedCandidate.githubUrl || "Не указан" }}</p>
            <p><strong>LinkedIn:</strong> {{ selectedCandidate.linkedinUrl || "Не указан" }}</p>
          </div>

          <div class="actions">
            <button class="secondary" @click="closeCandidateDetails">Закрыть</button>
            <button class="primary" @click="openInviteForm(selectedCandidate)">Пригласить на собеседование</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.company-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

.company-page h1 {
  margin: 0;
  line-height: 1.2;
}

.company-page h2 {
  margin: 0 0 14px;
}

.company-page h3 {
  margin: 0;
}

.company-page p {
  margin: 0;
}

.subtitle {
  margin-top: 8px;
  color: #64748b;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 16px 0;
}

.tabs button {
  width: 100%;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-color: #dbe3ef;
  color: #334155;
}

.tabs button.active {
  background: #2a2f8f;
  border-color: #2a2f8f;
  color: #fff;
}

.card {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #fff;
  padding: 18px;
}

.status {
  margin: 8px 0;
  padding: 10px;
  border-radius: 10px;
}

.status.error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

.status.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.state {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  margin: 0;
}

.card > label {
  margin-top: 12px;
}

textarea,
input,
select {
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  padding: 10px;
}

.vacancy-item,
.candidate-item {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}

.candidate-item.clickable {
  cursor: pointer;
}

.candidate-item.clickable:hover {
  border-color: #c6d5ec;
  background: #f8fbff;
}

.candidate-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.candidate-profile {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #243b7d;
  color: #fff;
  font-weight: 700;
}

.candidate-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.tag {
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}

.tag.score {
  border-color: #bfd6ff;
  background: #edf4ff;
  color: #233a7a;
}

.tag.readiness {
  border-color: #fcd6a2;
  background: #fff7ed;
  color: #b45309;
}

.tag.readiness.ok {
  border-color: #99f6e4;
  background: #f0fdfa;
  color: #0f766e;
}

.candidate-results {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.result-pill {
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  padding: 4px 10px;
}

.result-passed {
  color: #0f766e;
  border-color: #99f6e4;
  background: #f0fdfa;
}

.result-failed {
  color: #b45309;
  border-color: #fde68a;
  background: #fffbeb;
}

.result-not_submitted {
  color: #64748b;
  border-color: #dbe3ef;
  background: #f8fafc;
}

.vacancy-head,
.task-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.vacancy-summary {
  margin: 10px 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tags span {
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}

.tasks-block {
  margin-top: 12px;
}

.task-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8fafc;
}

.nested-form {
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  padding: 12px;
  margin-top: 12px;
  background: #fff;
}

.muted {
  color: #64748b;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: grid;
  place-items: center;
  padding: 12px;
  z-index: 40;
}

.modal-content {
  width: min(600px, 100%);
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #fff;
  padding: 18px;
}

.candidate-modal {
  max-height: 85vh;
  overflow: auto;
}

.candidate-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;
  margin-bottom: 8px;
}

.result-block {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
}

.task-results {
  display: grid;
  gap: 8px;
}

.task-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    grid-template-columns: 1fr;
  }

  .tabs button {
    width: 100%;
  }

  .candidate-top {
    flex-direction: column;
  }

  .candidate-grid {
    grid-template-columns: 1fr;
  }
}
</style>
