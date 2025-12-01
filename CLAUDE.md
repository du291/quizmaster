# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quizmaster is a training application for Scrum workshops at ScrumDojo.cz. Core features:
- Create and manage questions, workspaces, and quizzes
- Take standalone questions or complete quizzes

Built incrementally using thin slices of functionality—a key learning objective of the Scrum training.

## Architecture

**Monorepo with frontend built into backend:**
- Frontend: React 19 SPA (Vite) → builds to `backend/src/main/resources/static/`
- Backend: Spring Boot 3 serves frontend at `/` and REST APIs at `/api/*`
- Database: PostgreSQL (JPA/Hibernate + Flyway migrations)
- Deployment: Single JAR containing both frontend and backend

**Key insight:** Frontend must be built with `pnpm build` before running backend to see changes.

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.3.3, Gradle (Kotlin DSL), Lombok
- **Frontend:** TypeScript 5.7, React 19, Vite 6, Biome (linting), Cucumber + Playwright (E2E)
- **Database:** PostgreSQL
- **Swagger UI:** http://localhost:8080/swagger-ui/index.html

## Development Commands

**Setup:**
```bash
cd frontend && pnpm ci:install
```

**Running (choose one):**
```bash
# Production-like: frontend → backend
cd frontend && pnpm build && cd ../backend && ./gradlew bootRun  # :8080

# Development with HMR (recommended):
cd backend && ./gradlew bootRun     # :8080 backend
cd frontend && pnpm dev             # :5173 dev server (proxies API to :8080)
```

**Testing:**
```bash
cd frontend
pnpm code              # TypeScript + Biome lint/format
pnpm test:e2e          # E2E against :8080
pnpm test:e2e:vite     # E2E against :5173
pnpm test:e2e:ui       # Playwright UI at :3333
```

## Domain Model

**Three entities:**
1. **Question** - Question text, multiple answers, correct answer indices, explanations
   - Fields: `id`, `question`, `answers[]`, `correctAnswers[]`, `answerExplanations[]`, `questionExplanation`, `isEasyMode`, `editId` (UUID), `workspaceGuid`
2. **Workspace** - Collection of questions and quizzes (identified by GUID/UUID)
   - Fields: `guid`, `name`
3. **Quiz** - Assessment configuration
   - Fields: `id`, `title`, `description`, `questionIds[]`, `passScore`, `timeLimit`, `mode` (EXAM/LEARN), `finalCount`, `workspaceGuid`

**Key concepts:**
- **`mode` field**: `EXAM` = exam mode (feedback at end), `LEARN` = learning mode (feedback after each question)
- **`finalCount` field**: Limits quiz to N random questions from the question pool
- **`editId` field**: UUID used for editing questions without authentication (NOT encryption/hashing)
- **Standalone questions**: Original feature; users can take individual questions outside quizzes

## API Endpoints

**Quiz Management:**
- `GET /api/quiz/{id}` - Get quiz with all questions (returns `QuizResponse` DTO)
- `POST /api/quiz` - Create quiz with question IDs array
- `GET /api/workspaces/{guid}/quizzes` - Find quizzes in a workspace (returns array of `QuizListItem` DTOs)

**Question Management:**
- `GET /api/question/{id}` - Get question (with `deletable` flag)
- `POST /api/question` - Create question, returns `QuestionCreateResponse` DTO with `id` and `editId`
- `PATCH /api/question/{editId}` - Update question by editId (UUID)
- `GET /api/question/{editId}/edit` - Get question by editId for editing
- `GET /api/workspaces/{guid}/questions` - Get questions in a workspace (returns array of `QuestionListItem` DTOs)

**Workspace Management:**
- `GET /api/workspaces/{guid}` - Get workspace
- `POST /api/workspaces` - Create workspace, returns `WorkspaceCreateResponse` DTO with GUID

**Feature Flags:**
- `GET /api/feature-flag` - Returns whether feature flag is enabled

## API DTOs (Data Transfer Objects)

The API uses type-safe DTOs for cleaner responses:

**Backend DTOs:**
- `QuestionCreateResponse` - `{id: number, editId: string}` - Returned when creating questions
- `WorkspaceCreateResponse` - `{guid: string}` - Returned when creating workspaces
- `QuizResponse` - Complete quiz data including all Quiz fields
- `QuestionListItem` - `{id: number, question: string, editId: string}` - Lightweight question in workspace list
- `QuizListItem` - `{id: number, title: string}` - Lightweight quiz in workspace list

**Frontend Types:**
- `/frontend/src/model/question-list-item.ts`
- `/frontend/src/model/quiz-list-item.ts`

These DTOs are part of an ongoing API refactoring (see `API_REFACTORING_PLAN.md`).

## Frontend Routes

- `/` - Home (question/quiz creation)
- `/question/new` - Create question
- `/question/:id` - Take standalone question
- `/question/:editId/edit` - Edit question (uses editId UUID)
- `/workspace/new` - Create workspace
- `/workspace/:guid` - View workspace (questions and quizzes)
- `/quiz-create/new` - Create quiz
- `/quiz/:id` - Quiz welcome/info page
- `/quiz/:id/questions` - Take quiz

## Feature Flags

Hide unfinished features behind `FEATURE_FLAG=true` env var:

```typescript
// Frontend
if (FEATURE_FLAG_ENABLED) { /* ... */ }
```

```java
// Backend
if (FeatureFlag.isEnabled()) { /* ... */ }
```

```gherkin
# Tests
@feature-flag
Scenario: New feature
```

## Development Practices

Training repository emphasizing:
- **Trunk-Based Development** - All work on `master`
- **Test-Driven Development** - Tests first
- **Pair/Mob Programming** - Shared ownership
- **Thin slices** - Minimal incremental features

## Known Technical Debt / Future Improvements

1. **API Refactoring** → In progress (see `API_REFACTORING_PLAN.md`)
   - ✅ Completed: Entity renames (QuizQuestion→Question), endpoint path cleanup, DTO implementations
   - ⏳ Remaining: Additional DTO types, complete REST standardization
2. **Question edit IDs** → Already using UUIDs (`editId` field) - originally planned as "encrypted IDs" but implemented more simply
3. **Quiz-Question relationship** → Refactor int array to M:N junction table with referential integrity
4. **Progress state endpoint** → May not be optimal implementation
5. **Standalone questions** → Consider deprecation (kept for backward compatibility)
