import {
  api,
  type InterviewQuestionItem,
  type Roadmap,
  type RoadmapAssessment,
  type RoadmapNode,
  type RoadmapProgressItem,
  type RoadmapTopic,
  type TopicContent,
  type TopicResult,
  type TopicResultUpdateResponse,
  type TopicTest,
  type UserActivityDay
} from "@/shared/api/client"

export const roadmapsApi = {
  getRoadmaps(): Promise<Roadmap[]> {
    return api.getRoadmaps()
  },
  getRoadmapTree(roadmapId?: string): Promise<Record<string, RoadmapNode[]> | RoadmapNode[]> {
    return api.getRoadmapTree(roadmapId)
  },
  getRoadmapAssessment(roadmapId: string): Promise<RoadmapAssessment> {
    return api.getRoadmapAssessment(roadmapId)
  },
  getTopics(roadmapId?: string): Promise<RoadmapTopic[]> {
    return api.getTopics(roadmapId)
  },
  getTopicContent(topicId: string): Promise<TopicContent> {
    return api.getTopicContent(topicId)
  },
  getTopicTest(topicId: string): Promise<TopicTest> {
    return api.getTopicTest(topicId)
  },
  getTopicInterviewQuestions(topicId: string): Promise<InterviewQuestionItem[]> {
    return api.getTopicInterviewQuestions(topicId)
  },
  getUserRoadmapCollection(userId: number | null): Promise<string[]> {
    return api.getUserRoadmapCollection(userId)
  },
  getRoadmapProgress(userId: number | null): Promise<RoadmapProgressItem[]> {
    return api.getRoadmapProgress(userId)
  },
  getTopicResults(userId: number | null): Promise<TopicResult[]> {
    return api.getTopicResults(userId)
  },
  upsertTopicResult(userId: number | null, topicId: string, payload: { score: number; passed: boolean }): Promise<TopicResultUpdateResponse> {
    return api.upsertTopicResult(userId, topicId, payload)
  },
  updateUserRoadmapCollection(userId: number | null, roadmapIds: string[]): Promise<string[]> {
    return api.updateUserRoadmapCollection(userId, roadmapIds)
  },
  removeUserRoadmapFromCollection(userId: number | null, roadmapId: string): Promise<string[]> {
    return api.removeUserRoadmapFromCollection(userId, roadmapId)
  },
  getUserYearActivity(userId: number | null): Promise<UserActivityDay[]> {
    return api.getUserYearActivity(userId)
  }
}

export type {
  InterviewQuestionItem,
  Roadmap,
  RoadmapAssessment,
  RoadmapNode,
  RoadmapProgressItem,
  RoadmapTopic,
  TopicContent,
  TopicResult,
  TopicResultUpdateResponse,
  TopicTest,
  UserActivityDay
}
