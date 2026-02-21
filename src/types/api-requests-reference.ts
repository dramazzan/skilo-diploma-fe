/**
 * Mock Data Models Reference
 *
 * This file contains only models that are реально used in mock data files.
 * No endpoint list here.
 */

import type { AuthResponse, RoadmapProgressItem } from "@/services/api"
import type { InterviewQuestionItem } from "@/types/api-contract"
import type {
  AssessmentOption,
  AssessmentQuestion,
  Roadmap,
  RoadmapAssessment,
  RoadmapLevel,
  RoadmapNode,
  TopicStatus
} from "@/mocks/mockRoadmaps"
import type { ProfileData } from "@/mocks/mockProfile"
import type { RoadmapTopic, TestQuestion, TopicContent, TopicTest } from "@/mocks/mockRoadmap"
import type { VacancyItem, VacancyPreparation, VacancyQuestion, VacancyTask, VacancyTestQuestion } from "@/mocks/mockVacancies"

export interface MockDataModels {
  // mockData.ts
  authResponse: AuthResponse
  roadmapProgressItem: RoadmapProgressItem

  // mockProfile.ts
  profileData: ProfileData

  // mockRoadmaps.ts
  roadmapLevel: RoadmapLevel
  roadmap: Roadmap
  topicStatus: TopicStatus
  roadmapNode: RoadmapNode
  assessmentOption: AssessmentOption
  assessmentQuestion: AssessmentQuestion
  roadmapAssessment: RoadmapAssessment

  // mockRoadmap.ts
  roadmapTopic: RoadmapTopic
  topicContent: TopicContent
  testQuestion: TestQuestion
  topicTest: TopicTest

  // mockInterviewQuestions.ts
  interviewQuestionItem: InterviewQuestionItem

  // mockVacancies.ts
  vacancyQuestion: VacancyQuestion
  vacancyTestQuestion: VacancyTestQuestion
  vacancyPreparation: VacancyPreparation
  vacancyTask: VacancyTask
  vacancyItem: VacancyItem
}

export interface MockModelMeta {
  model: keyof MockDataModels
  sourceFile: string
  tsType: string
}

export const MOCK_DATA_MODELS_META: MockModelMeta[] = [
  { model: "authResponse", sourceFile: "src/mocks/mockData.ts", tsType: "AuthResponse" },
  { model: "roadmapProgressItem", sourceFile: "src/mocks/mockData.ts", tsType: "RoadmapProgressItem" },

  { model: "profileData", sourceFile: "src/mocks/mockProfile.ts", tsType: "ProfileData" },

  { model: "roadmapLevel", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "RoadmapLevel" },
  { model: "roadmap", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "Roadmap" },
  { model: "topicStatus", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "TopicStatus" },
  { model: "roadmapNode", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "RoadmapNode" },
  { model: "assessmentOption", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "AssessmentOption" },
  { model: "assessmentQuestion", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "AssessmentQuestion" },
  { model: "roadmapAssessment", sourceFile: "src/mocks/mockRoadmaps.ts", tsType: "RoadmapAssessment" },

  { model: "roadmapTopic", sourceFile: "src/mocks/mockRoadmap.ts", tsType: "RoadmapTopic" },
  { model: "topicContent", sourceFile: "src/mocks/mockRoadmap.ts", tsType: "TopicContent" },
  { model: "testQuestion", sourceFile: "src/mocks/mockRoadmap.ts", tsType: "TestQuestion" },
  { model: "topicTest", sourceFile: "src/mocks/mockRoadmap.ts", tsType: "TopicTest" },

  { model: "interviewQuestionItem", sourceFile: "src/mocks/mockInterviewQuestions.ts", tsType: "InterviewQuestionItem" },

  { model: "vacancyQuestion", sourceFile: "src/mocks/mockVacancies.ts", tsType: "VacancyQuestion" },
  { model: "vacancyTestQuestion", sourceFile: "src/mocks/mockVacancies.ts", tsType: "VacancyTestQuestion" },
  { model: "vacancyPreparation", sourceFile: "src/mocks/mockVacancies.ts", tsType: "VacancyPreparation" },
  { model: "vacancyTask", sourceFile: "src/mocks/mockVacancies.ts", tsType: "VacancyTask" },
  { model: "vacancyItem", sourceFile: "src/mocks/mockVacancies.ts", tsType: "VacancyItem" }
]
