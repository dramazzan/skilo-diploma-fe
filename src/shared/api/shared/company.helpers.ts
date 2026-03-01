import type {
  CandidateResultStatus,
  CompanyCandidate,
  CompanyCandidateEvaluation,
  CompanyCandidateTaskResult,
  Vacancy
} from "../types"
import {
  getCompanyCandidatesDbRaw,
  getCompanyVacanciesDb,
  saveCompanyCandidatesDb as persistCompanyCandidatesDb
} from "./storage"

const candidateSeedHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

const candidateScoreStatus = (score: number): CandidateResultStatus => {
  return score >= 70 ? "passed" : "failed"
}

const buildCandidateEvaluation = (
  candidate: Pick<CompanyCandidate, "id" | "status">,
  vacancy: Vacancy | null
): CompanyCandidateEvaluation => {
  const statusEngagement: Record<CompanyCandidate["status"], number> = {
    new: 0.38,
    reviewed: 0.68,
    invited: 0.9
  }

  const baseHash = candidateSeedHash(`${candidate.id}:${vacancy?.id ?? "no-vacancy"}`)
  const tasks = vacancy?.realTasks ?? []
  const taskResults: CompanyCandidateTaskResult[] = tasks.map((task, index) => {
    const scoreSeed = (baseHash + index * 37) % 100
    const submitted = scoreSeed < statusEngagement[candidate.status] * 100

    if (!submitted) {
      return {
        taskId: task.id,
        taskTitle: task.title,
        status: "not_submitted",
        score: null,
        submittedAt: null
      }
    }

    const score = 55 + (scoreSeed % 41)
    return {
      taskId: task.id,
      taskTitle: task.title,
      status: candidateScoreStatus(score),
      score,
      submittedAt: new Date(Date.now() - (index + 1) * 86400000).toISOString()
    }
  })

  const tasksSubmitted = taskResults.filter((item) => item.status !== "not_submitted").length
  const tasksPassed = taskResults.filter((item) => item.status === "passed").length
  const taskScores = taskResults.flatMap((item) => (typeof item.score === "number" ? [item.score] : []))

  const testTotal = Math.max(1, vacancy?.preparation.test.length ?? 0)
  const testTaken = baseHash % 100 < statusEngagement[candidate.status] * 100
  const testScore = testTaken ? 52 + ((baseHash + 11) % 44) : null
  const testCorrect = testScore ? Math.round((testScore / 100) * testTotal) : 0

  const interviewTotal = Math.max(1, vacancy?.preparation.questions.length ?? 0)
  const interviewTaken = (baseHash + 17) % 100 < statusEngagement[candidate.status] * 100
  const interviewScore = interviewTaken ? 54 + ((baseHash + 23) % 42) : null
  const interviewAnswered = interviewScore ? Math.round((interviewScore / 100) * interviewTotal) : 0

  const scorePool = [
    ...taskScores,
    ...(typeof testScore === "number" ? [testScore] : []),
    ...(typeof interviewScore === "number" ? [interviewScore] : [])
  ]

  const overallScore = scorePool.length
    ? Math.round(scorePool.reduce((sum, value) => sum + value, 0) / scorePool.length)
    : null

  const baseReadiness = overallScore ?? 0
  const completionBonus = tasks.length
    ? Math.round((tasksSubmitted / tasks.length) * 12)
    : 0
  const readinessPercent = Math.max(0, Math.min(100, baseReadiness + completionBonus))
  const readyForWork = readinessPercent >= 75 &&
    tasksPassed >= Math.ceil(tasks.length * 0.6) &&
    testScore !== null &&
    interviewScore !== null

  return {
    tasks: taskResults,
    tasksSubmitted,
    tasksPassed,
    tasksTotal: taskResults.length,
    test: {
      status: typeof testScore === "number" ? candidateScoreStatus(testScore) : "not_submitted",
      score: testScore,
      correctAnswers: testCorrect,
      totalQuestions: testTotal
    },
    interview: {
      status: typeof interviewScore === "number" ? candidateScoreStatus(interviewScore) : "not_submitted",
      score: interviewScore,
      answered: interviewAnswered,
      totalQuestions: interviewTotal
    },
    overallScore,
    workReadinessPercent: readinessPercent,
    readyForWork
  }
}

const createInitialCandidates = (vacancies: Vacancy[]): CompanyCandidate[] => {
  const first = vacancies[0]
  const second = vacancies[1] ?? first
  const third = vacancies[2] ?? first

  return [
    {
      id: "cand-1",
      fullName: "Айдана С.",
      email: "aidana.candidate@example.com",
      avatar: "A",
      phone: "+7 777 145 80 12",
      country: "Казахстан",
      city: "Алматы",
      university: "KBTU",
      experienceLevel: "junior",
      about: "Frontend-кандидат с фокусом на Vue и аккуратный UI.",
      skills: ["Vue", "TypeScript", "Pinia", "HTML/CSS"],
      portfolioUrl: "https://portfolio.example.com/aidana",
      githubUrl: "https://github.com/aidana-dev",
      linkedinUrl: "https://linkedin.com/in/aidana-dev",
      vacancyId: first?.id ?? "vac-frontend-junior-1",
      vacancyTitle: first?.title ?? "Junior Frontend-разработчик (Vue)",
      appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "new",
      inviteSentAt: null,
      evaluation: buildCandidateEvaluation({ id: "cand-1", status: "new" }, first ?? null)
    },
    {
      id: "cand-2",
      fullName: "Тимур А.",
      email: "timur.candidate@example.com",
      avatar: "T",
      phone: "+7 701 506 33 91",
      country: "Казахстан",
      city: "Астана",
      university: "ENU",
      experienceLevel: "middle",
      about: "Backend-разработчик, уверенно работает с Node.js и БД.",
      skills: ["Node.js", "PostgreSQL", "NestJS", "Docker"],
      portfolioUrl: "https://portfolio.example.com/timur",
      githubUrl: "https://github.com/timur-backend",
      linkedinUrl: "https://linkedin.com/in/timur-backend",
      vacancyId: second?.id ?? "vac-backend-middle-1",
      vacancyTitle: second?.title ?? "Middle Backend-разработчик (Node.js)",
      appliedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: "reviewed",
      inviteSentAt: null,
      evaluation: buildCandidateEvaluation({ id: "cand-2", status: "reviewed" }, second ?? null)
    },
    {
      id: "cand-3",
      fullName: "Назерке К.",
      email: "nazerke.candidate@example.com",
      avatar: "N",
      phone: "+7 705 661 27 55",
      country: "Казахстан",
      city: "Шымкент",
      university: "SDU",
      experienceLevel: "intern",
      about: "Начинающий аналитик данных, активно проходит тесты и практику.",
      skills: ["Python", "Pandas", "SQL", "Power BI"],
      portfolioUrl: "https://portfolio.example.com/nazerke",
      githubUrl: "https://github.com/nazerke-data",
      linkedinUrl: "https://linkedin.com/in/nazerke-data",
      vacancyId: third?.id ?? "vac-data-intern-1",
      vacancyTitle: third?.title ?? "Стажер-аналитик данных",
      appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "new",
      inviteSentAt: null,
      evaluation: buildCandidateEvaluation({ id: "cand-3", status: "new" }, third ?? null)
    }
  ]
}

export const getCompanyCandidatesDb = (): CompanyCandidate[] => {
  const persisted = getCompanyCandidatesDbRaw()

  if (persisted) {
    return persisted
  }

  const seeded = createInitialCandidates(getCompanyVacanciesDb())
  persistCompanyCandidatesDb(seeded)
  return seeded
}

export const saveCompanyCandidatesDb = (candidates: CompanyCandidate[]) => {
  persistCompanyCandidatesDb(candidates)
}

export const enrichCompanyCandidate = (candidate: CompanyCandidate, vacancies: Vacancy[]): CompanyCandidate => {
  const vacancy = vacancies.find((item) => item.id === candidate.vacancyId) ?? null
  const evaluation = buildCandidateEvaluation(candidate, vacancy)

  return {
    ...candidate,
    vacancyTitle: vacancy?.title ?? candidate.vacancyTitle,
    avatar: candidate.avatar || candidate.fullName.trim().slice(0, 1).toUpperCase(),
    phone: candidate.phone || "+7 700 000 00 00",
    country: candidate.country || "Казахстан",
    city: candidate.city || "Алматы",
    university: candidate.university || "Satbayev University",
    experienceLevel: candidate.experienceLevel || "junior",
    about: candidate.about || "Кандидат изучает направление и выполняет практические задания.",
    skills: candidate.skills?.length ? candidate.skills : ["Git", "REST API"],
    portfolioUrl: candidate.portfolioUrl || "",
    githubUrl: candidate.githubUrl || "",
    linkedinUrl: candidate.linkedinUrl || "",
    evaluation
  }
}
