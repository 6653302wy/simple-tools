# Project AGENTS.md - Frontend General

Follow the global AGENTS.md workflow and prefer the global skills:
- $task-sizing
- $analysis-workflow
- $plan-workflow
- $approval-gate
- $implement-workflow

This file adds frontend-specific project rules for React, Next.js, React Native, and Expo repositories.

---

## Core workflow

### Single-agent mode
In single-agent mode:
1. use $task-sizing first
2. use $analysis-workflow
3. use $plan-workflow
4. use $approval-gate
5. use $implement-workflow only when allowed

### Multi-agent mode
In multi-agent mode:
- the coordinator must begin with $task-sizing
- then use exactly three subagents unless the user requests otherwise:
  1. analysis agent using $analysis-workflow
  2. plan agent using $plan-workflow
  3. implement agent using $implement-workflow
- the coordinator must apply $approval-gate after planning
- do not let implement agent proceed until approval is allowed

Do not spawn subagents unless the user explicitly requested multi-agent mode.

---

## Frontend priorities

In this repository, prioritize:
1. consistency with existing patterns
2. small and reviewable changes
3. component reuse before new abstraction
4. stable data flow and predictable state management
5. correct platform/runtime boundaries
6. maintainable file placement
7. validation before handoff

Do not introduce new architecture or style systems without explicit need.

---

## Repository learning requirements

Before implementing, inspect and learn the repository’s existing rules for:

1. file placement
2. component split boundaries
3. hook reuse
4. state management
5. data fetching and mutation
6. styling and design system usage
7. form handling and validation
8. routing/navigation
9. platform/runtime boundaries
10. testing, linting, and type checking

Do not introduce a new pattern before confirming whether the repository already has one.

---

## File placement strict rules

- Keep files in the repository’s existing directory structure.
- Shared reusable UI belongs in the shared component area.
- Feature-local or screen-local components stay close to the owning feature unless there is clear reuse.
- Shared hooks belong in the repository’s hook area.
- Shared utilities belong in the existing utility/lib/helpers area.
- Shared constants, config, and types should follow the repository’s current placement rules.
- Avoid creating new top-level directories unless the repository structure clearly needs them.

Before adding a new file, inspect whether an equivalent category already exists.

---

## Component split strict rules

- Keep components small and single-purpose.
- Separate presentational UI from orchestration logic when the repository already follows that pattern.
- Avoid oversized page, screen, or container files with mixed concerns.
- Prefer composition over large wrapper hierarchies.
- Reuse existing primitives and shared UI patterns before creating new wrappers.
- Reuse existing loading, empty, error, skeleton, modal, list, and form field patterns when available.

If a component is used only once inside one feature, keep it local unless a clear reuse case already exists.

---

## Hook reuse strict rules

- Reuse existing hooks before creating a new one.
- Do not create a custom hook if local logic is simpler and clearer.
- Shared hooks must encapsulate repeated logic, not one-off component behavior.
- Hook APIs should be explicit, stable, and minimal.
- Avoid hooks that hide important side effects or obscure data flow.
- Prefer repository conventions for:
  - query/search params
  - form state
  - data fetching
  - data mutation
  - viewport/device/platform checks
  - memoization
  - feature-specific reusable logic

Before creating a hook, search for similar hooks first.

---

## State management strict rules

- Prefer local state for local UI behavior.
- Prefer lifted state only when shared ownership is actually needed.
- Prefer existing repository state tools and patterns.
- Do not introduce global state for narrowly scoped feature behavior.
- Do not introduce a new state library unless explicitly requested.
- Keep state shape small and predictable.
- Avoid duplicating the same data in multiple state layers unless the repository pattern requires it.

---

## Data fetching and mutation strict rules

- Follow the repository’s existing fetch and mutation pattern.
- Reuse existing service/api/client wrappers before adding new access layers.
- Keep server data concerns separate from presentational rendering when the repository already follows that split.
- Reuse existing error handling, retry, loading, and cache patterns.
- Do not invent a parallel data access abstraction.

If the repository has both server-driven and client-driven data patterns, inspect which one is appropriate for the current feature before implementing.

---

## Styling strict rules

- Follow the existing styling system only.
- Reuse existing design tokens, utility classes, theme helpers, variants, and shared primitives.
- Do not introduce a new styling approach.
- Match the repository’s spacing, naming, responsive rules, and component variant conventions.
- Prefer existing helper functions and style composition patterns before creating new ones.

---

## Forms and validation strict rules

- Reuse the repository’s existing form and validation stack.
- Keep validation rules close to the form or domain layer according to repository convention.
- Reuse existing field components and error rendering patterns.
- Avoid ad hoc form state patterns when a repository standard already exists.
- Keep submission, loading, success, and error states explicit.

---

## Routing / navigation strict rules

- Follow the repository’s current route or navigation structure.
- Do not reshape routing or navigation architecture unless explicitly requested.
- Keep route parameters, query parameters, and navigation payloads aligned with repository conventions.
- Reuse existing helpers for route generation, deep linking, or param parsing when available.

---

## Platform and runtime boundary strict rules

- Respect framework and platform boundaries.
- Do not move browser-only logic into non-browser contexts.
- Do not move native/platform-only logic into shared code without checking existing conventions.
- Isolate runtime-specific code when the repository supports multiple platforms.
- Be careful with hydration-sensitive or platform-sensitive output.

For React Native / Expo:
- inspect platform-specific components and navigation patterns before adding cross-platform abstractions
- reuse existing platform checks and wrappers

For Next.js or mixed SSR/CSR repos:
- preserve server/client boundaries
- do not widen client boundaries for convenience

---

## Performance strict rules

- Avoid unnecessary re-renders, unstable props, and repeated heavy calculations in render paths.
- Reuse existing memoization and list optimization patterns when they already exist.
- Avoid creating abstraction layers that make render behavior harder to reason about.
- Avoid unnecessary allocations or subscriptions in frequently updated UI.
- Prefer correctness and clarity first, then optimize based on repository patterns.

---

## Validation and delivery

Before finishing, validate in this order when available:
1. targeted test for changed module
2. targeted typecheck or repository typecheck command
3. targeted lint or repository lint command
4. broader validation only if needed

Use the repository’s actual package manager and scripts.

At the end of implementation, always report:
- changed files
- why each file changed
- whether existing repository patterns were reused
- validation performed
- remaining risks

---

## Guardrails

- No broad refactor unless explicitly requested.
- No new dependency without strong need.
- No duplicate components, hooks, or utilities when reusable ones already exist.
- No silent breaking API or behavior changes.
- No directory reshuffle without explicit approval.
- No architecture changes hidden inside a feature task.