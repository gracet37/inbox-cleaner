---
name: react-clean-refactor
description: Step through a React + TypeScript codebase file by file and refactor each one to follow clean code principles, splitting large components into small, focused components, hooks, and utilities. Use whenever the user asks to refactor, clean up, tidy, restructure, modularise, break up, or "componentise" React code, or mentions clean code, single responsibility, large components, prop drilling, or code smells, even if they don't say "refactor" explicitly.
---

# React Clean Refactor

Refactor a React/TypeScript codebase one file at a time, behaviour-preserving, with a checkpoint after every file.

## Ground rules

- **Behaviour must not change.** No new features, no visual changes, no API changes unless the user asks. Refactor and feature work never share a step.
- **One file per step.** Finish, verify, and report on one file before touching the next.
- **Small, reversible changes.** Prefer several small extractions over one rewrite. Never leave the app in a broken state between steps.
- **Match the codebase.** Follow existing naming, folder layout, styling approach and test setup unless the user asks to change them.
- **Don't invent abstractions.** Extract only when it improves clarity, removes duplication, or isolates a responsibility.

## Workflow

### Phase 1: Survey (once)

1. Read the project structure, `package.json`, `tsconfig`, lint/format config, and how tests are run.
2. List candidate files (`.tsx`, `.ts` under `src/`) and rank them by refactor value: file length, number of `useState`/`useEffect` calls, JSX nesting depth, mixed concerns (fetching + logic + markup), duplication.
3. Present the ranked list as a plan (file, main problems, estimated effort). **Ask the user to confirm the order or scope before editing anything.**
4. Record the baseline: run type-check, lint and tests, and note any pre-existing failures so they aren't blamed on the refactor.

### Phase 2: Per-file loop

For each file, in the agreed order:

1. **Read** the whole file and its direct imports/consumers (find usages before changing any exported name or prop).
2. **Diagnose.** List smells using `references/smells-and-fixes.md`. Keep the list short and prioritised.
3. **Propose** a short plan: new files to create, what moves where, any renamed exports. For non-trivial splits, wait for approval; for trivial ones, proceed.
4. **Refactor** in this order (stop when the file is clean, not when every rule is applied):
   1. Rename for clarity (variables, functions, props, types).
   2. Remove dead code, unused imports, stale comments, commented-out code.
   3. Replace magic values with named constants; replace nested ternaries/`if` pyramids with early returns or lookup objects.
   4. Extract pure logic into plain utility functions (no React).
   5. Extract stateful/effectful logic into custom hooks (`useXxx`).
   6. Extract presentational pieces into child components.
   7. Tighten types: remove `any`, define prop interfaces, derive types instead of duplicating them.
5. **Verify.** Run type-check, lint, relevant tests, and a build if cheap. Fix regressions caused by your change. If no tests cover the code, say so and list what manual check the user should do.
6. **Report** using the template below, then **pause for the user** before the next file unless they said to continue automatically.

### Report template (after each file)

```
File: path/to/File.tsx
Before: <lines, # of responsibilities>  →  After: <lines, new files>
Changes: <3-6 bullets>
New files: <paths>
Verification: type-check ✅/❌  lint ✅/❌  tests ✅/❌/none
Behaviour changes: none (or flag anything suspicious you noticed but did NOT change)
Next up: <next file in plan>
```

Flag bugs or risky code you notice, but do not fix them inside a refactor step. Offer them as a separate follow-up.

## Component extraction rules

Extract a component when **any** of these is true:
- The JSX block has its own name in your head ("the order summary", "the filter bar").
- It is repeated, or repeated with small variations (parameterise via props).
- A `.map()` callback body exceeds ~10 lines.
- It owns its own state that no sibling needs.
- The parent exceeds ~150 lines or mixes data-fetching with layout.

Do **not** extract when the piece is a single trivial element, would need 8+ props to work, or would only be used once with no clarity gain.

Target shape for every component:
- Does one thing; name is a noun phrase (`InvoiceTable`), handlers are `handleXxx`, callback props are `onXxx`.
- Props are an explicit named interface, typically 5 or fewer. Many related props usually mean a missing object or a missing component.
- Composition over configuration: prefer `children` or slots over boolean-prop soup.
- Containers (data, state) are separated from presentational components (props in, JSX out).
- Co-locate: `Feature/Component.tsx`, `Component.test.tsx`, `useComponentLogic.ts`, `types.ts`, `index.ts` (public API only).

See `references/react-patterns.md` for hooks, state, performance and file-structure guidance, and `references/smells-and-fixes.md` for the smell catalogue.

## Clean code checklist (apply per file)

- Functions do one thing and are short enough to read without scrolling.
- Names reveal intent; no abbreviations, no `data`/`info`/`temp`/`handleClick2`.
- No boolean flag arguments that switch behaviour; split into two functions or components.
- No deeply nested conditionals (max ~2 levels); use guard clauses.
- No duplicated logic (rule of three: extract on the third occurrence).
- Derived values are computed, not stored in state.
- Effects only synchronise with external systems; no effect chains to derive state.
- Side effects and I/O live in hooks or services, not in render paths.
- Comments explain *why*, never *what*.
- Types are precise; `any` and non-null `!` assertions are justified or removed.
- Imports are ordered and unused ones removed.

## Safety

- Never change public exports, route paths, query keys, analytics event names, or CSS class names used elsewhere without searching all usages first.
- Preserve hook call order and dependency semantics; don't "fix" a dependency array during a refactor without flagging it.
- Keep `key` props stable.
- If a change might alter render timing or behaviour (memoisation, effect splitting, state lifting), call it out explicitly in the report.
- Commit-sized steps: suggest the user commit after each verified file (e.g. `refactor(Component): extract X and useX`).
