import { mockInterviewQuestionsByTopic } from "@/shared/mocks/mockInterviewQuestions"

import type { InterviewQuestionItem } from "../types"
import { delay, USE_MOCK } from "../shared/runtime"

export const createInterviewService = () => ({
  async getTopicInterviewQuestions(topicId: string): Promise<InterviewQuestionItem[]> {
    if (USE_MOCK) {
      return await delay(300).then(() => mockInterviewQuestionsByTopic[topicId] ?? [])
    }

    await delay(700)
    return []
  }
})
