import { api, type InterviewQuestionItem } from "@/shared/api/client"

export const interviewApi = {
  getTopicInterviewQuestions(topicId: string): Promise<InterviewQuestionItem[]> {
    return api.getTopicInterviewQuestions(topicId)
  }
}

export type { InterviewQuestionItem }
