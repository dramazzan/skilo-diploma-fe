import { mockRoadmap } from "@/mocks/mockRoadmap"
import type { InterviewQuestionItem } from "@/types/api-contract"

const makeInterviewPack = (topicId: string, title: string): InterviewQuestionItem[] => [
  {
    id: `${topicId}-i1`,
    topicId,
    question: `How would you explain ${title} to a junior developer?`,
    answer:
      `Start with core concepts, then show one practical use case, and finally mention common mistakes. For ${title}, focus on when to use it and the trade-offs.`
  },
  {
    id: `${topicId}-i2`,
    topicId,
    question: `What are common pitfalls in ${title}?`,
    answer:
      `Typical issues include overengineering, poor debugging visibility, and skipping validation. A good answer should include prevention steps and examples.`
  },
  {
    id: `${topicId}-i3`,
    topicId,
    question: `How would you assess production readiness for ${title}?`,
    answer:
      `Check reliability, performance under load, observability, and rollback strategy. Interviewers expect concrete metrics and a verification plan.`
  }
]

export const mockInterviewQuestionsByTopic: Record<string, InterviewQuestionItem[]> = Object.fromEntries(
  mockRoadmap.map((topic) => [topic.id, makeInterviewPack(topic.id, topic.title)])
)
