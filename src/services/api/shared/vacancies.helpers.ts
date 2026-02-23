import type {
  CandidateWorkLeaderboardEntry,
  VacancyTaskLeaderboardEntry,
  VacancyTaskSubmission
} from "../types"

export const evaluateSubmissionQuality = (submission: VacancyTaskSubmission): number => {
  const url = submission.solutionUrl.toLowerCase()
  const commentLength = submission.comment.trim().length
  const urlScore = url.includes("github") ? 36 : url.startsWith("http") ? 24 : 12
  const commentScore = Math.min(34, Math.floor(commentLength / 4))
  const base = 28

  return Math.max(0, Math.min(100, base + urlScore + commentScore))
}

export const verdictByScore = (score: number): CandidateWorkLeaderboardEntry["aiVerdict"] => {
  if (score >= 85) return "excellent"
  if (score >= 75) return "strong"
  if (score >= 60) return "good"

  return "needs_improvement"
}

export const createMockWorkLeaders = (): CandidateWorkLeaderboardEntry[] => {
  return [
    {
      userId: 11,
      fullName: "Aruzhan K.",
      avatar: "A",
      company: "Kaspi Tech",
      vacancyTitle: "Junior Frontend Developer (Vue)",
      tasksSubmitted: 4,
      averageQualityScore: 91,
      aiVerdict: "excellent",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    },
    {
      userId: 15,
      fullName: "Nikita S.",
      avatar: "N",
      company: "Freedom Tech",
      vacancyTitle: "Middle Backend Developer (Node.js)",
      tasksSubmitted: 3,
      averageQualityScore: 84,
      aiVerdict: "strong",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    },
    {
      userId: 22,
      fullName: "Miras T.",
      avatar: "M",
      company: "Halyk Digital",
      vacancyTitle: "Data Analyst Intern",
      tasksSubmitted: 2,
      averageQualityScore: 76,
      aiVerdict: "strong",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    }
  ]
}

export const createMockVacancyTaskLeaders = (vacancyId: string): VacancyTaskLeaderboardEntry[] => {
  if (vacancyId === "vac-frontend-junior-1") {
    return [
      {
        userId: 11,
        fullName: "Aruzhan K.",
        avatar: "A",
        tasksSubmitted: 2,
        averageQualityScore: 92,
        aiVerdict: "excellent",
        sentToHr: true,
        sentAt: new Date().toISOString(),
        rank: 0
      },
      {
        userId: 34,
        fullName: "Dana M.",
        avatar: "D",
        tasksSubmitted: 2,
        averageQualityScore: 87,
        aiVerdict: "excellent",
        sentToHr: true,
        sentAt: new Date().toISOString(),
        rank: 0
      },
      {
        userId: 19,
        fullName: "Timur B.",
        avatar: "T",
        tasksSubmitted: 1,
        averageQualityScore: 79,
        aiVerdict: "strong",
        sentToHr: false,
        sentAt: null,
        rank: 0
      }
    ]
  }

  if (vacancyId === "vac-backend-middle-1") {
    return [
      {
        userId: 15,
        fullName: "Nikita S.",
        avatar: "N",
        tasksSubmitted: 2,
        averageQualityScore: 88,
        aiVerdict: "excellent",
        sentToHr: true,
        sentAt: new Date().toISOString(),
        rank: 0
      },
      {
        userId: 29,
        fullName: "Rustem A.",
        avatar: "R",
        tasksSubmitted: 2,
        averageQualityScore: 81,
        aiVerdict: "strong",
        sentToHr: true,
        sentAt: new Date().toISOString(),
        rank: 0
      },
      {
        userId: 31,
        fullName: "Olga V.",
        avatar: "O",
        tasksSubmitted: 1,
        averageQualityScore: 73,
        aiVerdict: "good",
        sentToHr: false,
        sentAt: null,
        rank: 0
      }
    ]
  }

  return [
    {
      userId: 22,
      fullName: "Miras T.",
      avatar: "M",
      tasksSubmitted: 2,
      averageQualityScore: 84,
      aiVerdict: "strong",
      sentToHr: true,
      sentAt: new Date().toISOString(),
      rank: 0
    },
    {
      userId: 44,
      fullName: "Aida K.",
      avatar: "A",
      tasksSubmitted: 2,
      averageQualityScore: 77,
      aiVerdict: "strong",
      sentToHr: false,
      sentAt: null,
      rank: 0
    },
    {
      userId: 46,
      fullName: "Sergey P.",
      avatar: "S",
      tasksSubmitted: 1,
      averageQualityScore: 69,
      aiVerdict: "good",
      sentToHr: false,
      sentAt: null,
      rank: 0
    }
  ]
}
