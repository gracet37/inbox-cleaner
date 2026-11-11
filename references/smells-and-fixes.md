# Smells → fixes

| Smell | Typical fix |
|---|---|
| Component >150 lines or >1 responsibility | Split by responsibility: container + presentational children |
| 3+ `useState` + `useEffect` mixed with JSX | Extract a custom hook |
| `.map()` with large inline JSX | Extract row component, pass the item as a prop |
| Prop drilling through 3+ layers | Composition (`children`), or Context for cross-cutting data |
| Boolean prop explosion (`isPrimary`, `isLarge`, `isGhost`) | `variant`/`size` union props, or separate components |
| Nested ternaries in JSX | Early returns, lookup object, or small subcomponent |
| Fetching inside component body/effect | Move to a data hook/service |
| Derived state in `useState` + `useEffect` | Compute in render |
| Duplicate JSX blocks | Shared component with props |
| Duplicate logic across files | Shared util/hook (on third occurrence) |
| Magic strings/numbers | Named constants or enums/unions |
| Inline arrow handlers with logic | Named `handleXxx` functions or move logic into a hook |
| `any`, `as` casts, `!` | Proper types, narrowing, type guards |
| God file with many exports | One component per file, barrel `index.ts` for the public API |
| Business logic in JSX | Pure util functions, unit-testable |
| Comments describing *what* | Rename or extract so code explains itself |
| Long parameter lists | Parameter object with a named type |
| Index used as `key` on dynamic lists | Stable id |
| Dead code / unused exports | Delete (version control remembers) |
