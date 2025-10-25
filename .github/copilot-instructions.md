
# Copilot Instructions for vite-react-template

## Overview
Minimal React 19 + TypeScript 5 app using Vite 7. Designed for fast prototyping and simple structure. No routing or state management by default.

## Architecture
- Entry: `src/main.tsx` mounts `App.tsx` (root component)
- All components live in `src/`, assets in `src/assets/` or `public/`
- No custom service boundaries or data flows; add logic in `src/` as needed

## Developer Workflows
- Start dev server: `npm run dev` (port 3000)
- Build: `npm run build` (type-checks, then builds)
- Preview: `npm run preview`
- Lint: `npm run lint`
- Serve production: `npm start` (serves `dist/`)

## Conventions
- Use functional components and React hooks (see `App.tsx`)
- TypeScript required for all source files
- Add new components to `src/` and import in `App.tsx`
- Static assets: use `public/` for root, `src/assets/` for imports
- ESLint config is modular; see `eslint.config.js` and `README.md` for extending rules

## Integration Points
- Vite plugins: `@vitejs/plugin-react` for Fast Refresh
- ESLint: see `eslint.config.js` and `README.md` for recommended plugins
- No backend/API integration; add fetch/axios in `src/` if needed

## Example: Add a Component
Create `src/MyComponent.tsx`:
```tsx
import React from 'react';
export function MyComponent() {
   return <div>Hello from MyComponent!</div>;
}
```
Import and use in `App.tsx`:
```tsx
import { MyComponent } from './MyComponent';
// ...existing code...
<MyComponent />
// ...existing code...
```

## References
- See updated `README.md` for scripts and config details
- Vite: https://vitejs.dev/
- React: https://react.dev/