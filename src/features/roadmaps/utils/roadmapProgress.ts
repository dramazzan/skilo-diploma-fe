import type { RoadmapNode, TopicStatus } from "@/shared/mocks/mockRoadmaps"
import type { TopicResult } from "@/features/roadmaps/store/topicProgress"

const resolveParentStatus = (children: RoadmapNode[]): TopicStatus => {
  if (children.every((child) => child.status === "completed")) {
    return "completed"
  }

  if (children.some((child) => child.status === "completed" || child.status === "in_progress")) {
    return "in_progress"
  }

  return "not_started"
}

const mapListWithProgress = (
  nodes: RoadmapNode[],
  isParentUnlocked: boolean,
  getResult: (topicId: string) => TopicResult | null
): RoadmapNode[] => {
  let previousNodeCompleted = true

  return nodes.map((node) => {
    const isUnlocked = isParentUnlocked && previousNodeCompleted

    if (node.children?.length) {
      const children = mapListWithProgress(node.children, isUnlocked, getResult)

      const status: TopicStatus = isUnlocked ? resolveParentStatus(children) : "locked"
      previousNodeCompleted = status === "completed"

      return {
        ...node,
        status,
        children
      }
    }

    let status: TopicStatus = "locked"

    if (isUnlocked) {
      const result = getResult(node.id)

      if (!result) {
        status = node.status === "locked" ? "not_started" : node.status
      } else {
        status = result.passed ? "completed" : "in_progress"
      }
    }

    previousNodeCompleted = status === "completed"

    return {
      ...node,
      status
    }
  })
}

export const mapRoadmapTreeWithProgress = (
  nodes: RoadmapNode[],
  getResult: (topicId: string) => TopicResult | null
): RoadmapNode[] => {
  return mapListWithProgress(nodes, true, getResult)
}
