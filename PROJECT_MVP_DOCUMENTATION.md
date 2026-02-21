# Skilo FE - MVP Work Documentation

## 1. Project Summary
This document consolidates all implemented MVP work for the Vue 3 + TypeScript (Vite) frontend.

Stack in use:
- Vue 3 (Composition API)
- TypeScript (in key domains/models)
- Pinia
- Vue Router
- Mock API layer (`src/services/api.ts`) + localStorage persistence

## 2. Implemented Features (Completed)

### 2.1 Roadmap Collection and Navigation
- Roadmaps page split into:
  - `My Roadmaps`
  - `Add Direction`
- User can:
  - Open roadmap
  - Start assessment for new roadmap
  - Remove roadmap from collection
- Route cleanup and focused navigation to required pages.

Files:
- `src/views/RoadmapsView.vue`
- `src/store/roadmaps.ts`
- `src/router/index.ts`

### 2.2 Roadmap Assessment (Level Detection)
- Added assessment flow before adding new roadmap.
- Assessment returns assigned level (`Beginner | Intermediate | Advanced`).
- Added more assessment questions and improved UI.

Files:
- `src/views/RoadmapAssessmentView.vue`
- `src/mocks/mockRoadmaps.ts`
- `src/store/roadmaps.ts`

### 2.3 Roadmap Detail - Two View Modes
Roadmap detail supports **two user-selectable modes**:
- `Skill Tree` (interactive graph)
- `Classic List` (legacy recursive list)

View mode is persisted in localStorage (`roadmap_view_mode`).

Files:
- `src/views/RoadmapDetailView.vue`
- `src/components/RoadmapTree.vue`
- `src/components/RoadmapListNode.vue`

### 2.4 Interactive Skill Tree (Game-like UI)
Implemented a visual tree layout instead of simple accordion list:
- Dynamic node layout (depth-based with organic offsets)
- SVG curved connections
- Node states:
  - `locked`
  - `not_started`
  - `in_progress`
  - `completed`
- Pan & zoom support
- Tooltip on hover
- Modal for branch details
- Leaf node click opens topic directly

Files:
- `src/components/RoadmapTree.vue`
- `src/components/RoadmapNode.vue`
- `src/components/RoadmapConnection.vue`

### 2.5 Topic Learning + Test
Topic page includes:
- Theory section
- Test flow with:
  - Timer
  - Sequential questions (one-by-one)
  - Final score
  - Pass/fail state
  - Retake support

Files:
- `src/views/TopicView.vue`
- `src/mocks/mockRoadmap.ts`
- `src/store/topicProgress.ts`

### 2.6 Interview Q&A Per Topic
- Added Interview tab for each topic.
- Questions shown as list; answer opens by click.
- Uses mock server call now.

Files:
- `src/views/TopicInterviewView.vue`
- `src/mocks/mockInterviewQuestions.ts`
- `src/services/api.ts`

### 2.7 Progress and Unlock Logic
- Added topic result persistence (`passed`, `score`, `updatedAt`).
- Tree status is mapped using progress + lock rules.
- Parent/child progression and locked states are recalculated.

Files:
- `src/utils/roadmapProgress.ts`
- `src/store/topicProgress.ts`
- `src/views/RoadmapDetailView.vue`

### 2.8 Collection Persistence + Optimistic Remove
- User roadmap collection now behaves as server-driven contract.
- Remove from collection works optimistically:
  - UI updates immediately
  - rollback on API failure

Files:
- `src/store/roadmaps.ts`
- `src/services/api.ts`

### 2.9 API Contract Consolidation
- All frontend-expected server models were consolidated into one contract file.
- Added endpoint documentation and MVP flow in same file.

File:
- `src/types/api-contract.ts`

### 2.10 UI/Styling Iterations
- Global minimal but modern style system.
- Improved card grid alignment and responsive behavior.
- Level-based card colors and redesigned roadmap cards.
- Improved test UI and skill-tree text contrast/readability.

File:
- `src/assets/main.css`

## 3. Data & Mock Layer
Current MVP uses mock data with server-like behavior.

Mock sources:
- `src/mocks/mockRoadmaps.ts` (roadmaps, trees, assessments)
- `src/mocks/mockRoadmap.ts` (topics, content, tests)
- `src/mocks/mockInterviewQuestions.ts` (interview Q&A)
- `src/mocks/mockData.ts` (auth defaults, collection defaults, progress)

Mock API facade:
- `src/services/api.ts`

Persistence mechanism:
- localStorage keys managed in stores/services.

## 4. Routing Map (Current)
Main routes:
- `/roadmaps`
- `/roadmaps/:id`
- `/roadmaps/:id/assessment`
- `/topics/:id`
- `/topics/:id/interview`
- `/login`
- `/register`
- `/onboarding`
- `/profile`

Source:
- `src/router/index.ts`

## 5. State Management Map
Pinia stores:
- `auth` (`src/store/auth.ts`)
  - token/user/firstLogin
- `roadmaps` (`src/store/roadmaps.ts`)
  - collection IDs, assigned levels, progress, optimistic remove
- `topic-progress` (`src/store/topicProgress.ts`)
  - topic test result persistence

## 6. How It Works End-to-End (MVP Flow)
1. User opens roadmaps page.
2. App loads collection/progress from mock API.
3. User adds direction via assessment.
4. Roadmap appears in `My Roadmaps` with assigned level and progress.
5. In roadmap detail, user chooses `Skill Tree` or `Classic List`.
6. User opens leaf topic, studies theory, passes test.
7. Test result is saved; roadmap tree status updates.
8. User can open Interview tab for topic-specific Q&A.
9. User can remove roadmap from collection with immediate UI update.

## 7. Current Known Limitations
- Backend is mocked; real HTTP integration is not connected yet.
- TailwindCSS is not configured; styling is custom CSS.
- Some progress values are still mock-driven and should be server-sourced in production.
- Auth/session flow is MVP-level (token stored in localStorage).

## 8. Recommended Next Steps
1. Replace mock API in `src/services/api.ts` with real endpoints from `src/types/api-contract.ts`.
2. Move all progress calculations to backend and return consistent roadmap/tree progress payloads.
3. Add integration tests for:
   - assessment -> collection update
   - topic test -> tree unlock flow
   - optimistic remove rollback.
4. Add route guards for auth-required pages.
5. Optionally migrate styles to Tailwind utility classes if needed.

## 9. Key Files Index
- `src/types/api-contract.ts` - unified backend contract + endpoint docs
- `src/services/api.ts` - mock API transport layer
- `src/store/roadmaps.ts` - collection/progress state + optimistic updates
- `src/store/topicProgress.ts` - topic test results storage
- `src/utils/roadmapProgress.ts` - node status mapping logic
- `src/views/RoadmapsView.vue` - roadmap cards, open/add/remove actions
- `src/views/RoadmapDetailView.vue` - view mode switch (tree/list)
- `src/components/RoadmapTree.vue` - interactive skill tree container
- `src/components/RoadmapNode.vue` - visual node states and tooltip
- `src/components/RoadmapConnection.vue` - SVG tree connections
- `src/components/RoadmapListNode.vue` - legacy list mode
- `src/views/TopicView.vue` - learning + test flow
- `src/views/TopicInterviewView.vue` - interview Q&A list
- `src/assets/main.css` - global styles and card design system
