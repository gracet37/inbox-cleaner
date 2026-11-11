# React design patterns reference

## State
- Keep state as close as possible to where it's used; lift only when siblings need it.
- Don't store derived data in state; compute during render (`useMemo` only if measured as expensive).
- Group state that changes together (`useReducer` or one object) when transitions are coupled.
- Server state belongs in a data-fetching library (e.g. TanStack Query) if the project already uses one; otherwise inside a dedicated hook.
- Avoid prop drilling beyond ~2 levels: use composition (`children`), or Context for genuinely cross-cutting data (theme, auth, locale). Don't put fast-changing state in a single large context.

## Custom hooks
- Extract a hook when logic uses React primitives (state/effect/ref) and is either reusable or obscures the component's purpose.
- Name `useThing`; return a small, stable API (object for >2 values, tuple for 2).
- One concern per hook. Compose small hooks rather than building a god-hook.
- Pure logic without React primitives is a plain function, not a hook.

## Effects
- Use effects only to sync with external systems (network, subscriptions, DOM APIs, timers).
- Never use an effect to transform data for render or to respond to a user event; do that in render or the event handler.
- Always clean up subscriptions/timers; keep dependency arrays honest.

## Component patterns
- Container/presentational split: container fetches and wires, presentational renders.
- Compound components for related UI (`Tabs`, `Tabs.List`, `Tabs.Panel`) sharing implicit state.
- Render props / slots only when children need data from the parent; otherwise prefer plain `children`.
- Lists: extract the row into its own component; stable `key` from data id, never array index for reorderable lists.
- Conditional rendering: early return for loading/error/empty states, then the happy path.
- Forms: keep field components dumb; centralise validation schema (e.g. Zod) outside JSX.

## TypeScript
- `interface FooProps` (or `type`) declared above the component; no inline anonymous prop types for anything non-trivial.
- Prefer discriminated unions over multiple optional props/booleans.
- Derive types (`ReturnType`, `Pick`, `z.infer`) instead of duplicating shapes.
- Use `ComponentProps<'button'>` to extend native elements.
- No `any`; use `unknown` and narrow.

## Performance (only when justified)
- Don't add `memo`/`useCallback`/`useMemo` speculatively during a refactor. Add only where there's a measured problem or a stable-identity requirement.
- Splitting components often fixes re-render problems by itself (state moved down).

## Folder structure (adapt to existing conventions)
```
src/
  features/
    orders/
      components/      OrderList.tsx, OrderRow.tsx
      hooks/           useOrders.ts
      utils/           formatOrderTotal.ts
      types.ts
      index.ts         public exports only
  components/ui/       shared presentational primitives
  lib/                 framework-agnostic helpers, API clients
```

## Accessibility (don't regress during refactors)
- Preserve semantic elements, labels, `aria-*`, focus order and keyboard handlers when moving JSX.
