# React Static PWA Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-file static application with a React and Vite application that generates a static, installable PWA while preserving the current user experience and visual design.

**Architecture:** Vite builds a React application to a deployable `dist/` directory. Components render structured local translation data, while small services isolate browser APIs for speech synthesis, microphone recording, local storage, and PWA installation. `vite-plugin-pwa` generates the manifest and service worker.

**Tech Stack:** React, Vite, vite-plugin-pwa, Vitest, React Testing Library, Playwright, ESLint.

---

## Scope And Constraints

- Preserve the current three languages, seizure first-aid content, education mode, toy record/play mode, local click counter, installation guidance, informational panels, and embedded YouTube video.
- Retain session-only recordings. Do not add IndexedDB persistence or a backend.
- Build a static site only; deployment consumes `dist/`.
- Preserve the current design. This migration is not a redesign.
- Commit visual screenshot baselines under `tests/visual/baselines/` on the worktree feature branch. Never commit implementation work directly to `main`.
- Use a dedicated feature branch and worktree under `.worktrees/`.

## Risks And Decisions

- The displayed global click count remains a local-storage simulation. Internally, code and tests should describe it accurately as local.
- Browser speech, microphone access, recording codecs, and PWA install prompts are device-specific. UI must show translated error or fallback states rather than fail.
- The current organization logo is remote and cannot be guaranteed offline before it has been fetched. Preserve it during this migration; packaging an approved local logo is separate work.
- Service worker output is generated rather than maintained by hand, avoiding stale cache-version mistakes.
- Visual screenshot comparisons can vary slightly by browser font rendering. Use a fixed Chromium version and a conservative per-pixel threshold.

## Milestones

- [ ] M01: Capture and commit legacy visual baselines.
- [ ] M02: Scaffold React, Vite, test, and PWA tooling.
- [ ] M03: Extract content and browser services with unit tests.
- [ ] M04: Migrate interface and interaction behavior with visual parity.
- [ ] M05: Add quality commands, end-to-end tests, and complete regression verification.

## Task 1: Capture Legacy Visual Baselines

**Files:**
- Create: `tests/visual/baselines/*.png`
- Create: `tests/visual/legacy-baseline.spec.js`
- Create: `playwright.config.js`
- Create: `package.json` only if needed to run the baseline harness

**Steps:**
1. Create a minimal browser-test harness capable of serving the unmodified legacy `index.html`.
2. Capture approved screenshots at 320px, 375px, 430px, 768px, and 1440px widths.
3. Capture Traditional Chinese, Simplified Chinese, English, toy mode, expanded setup, expanded explanation, expanded FAQ, and recording-pulse states.
4. Commit the generated approved baseline images on the feature branch before React visual code is introduced.

**Programmatic Testing:** Run the dedicated baseline capture command and verify all expected image files exist.

**Human Testing:** Confirm baseline images accurately represent the existing public site in Chromium and the mobile viewports.

## Task 2: Scaffold Static React PWA

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles.css`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`

**Steps:**
1. Add React, Vite, PWA, unit-test, browser-test, and lint dependencies.
2. Add npm scripts for development, unit tests, linting, production builds, end-to-end tests, and visual tests.
3. Configure Vite with `base: './'` and `vite-plugin-pwa` manifest metadata matching the current product.
4. Configure generated service-worker registration and precaching of built local assets.
5. Confirm `npm run build` produces a static `dist/` application with manifest and service-worker assets.

**Programmatic Testing:** Write a failing App smoke test, implement the minimum App, then run it and the production build.

**Human Testing:** Open the generated static output locally and confirm it loads without a development server runtime.

## Task 3: Extract Content And Browser Services

**Files:**
- Create: `src/data/translations.js`
- Create: `src/data/educationSteps.js`
- Create: `src/services/clickCounter.js`
- Create: `src/services/speech.js`
- Create: `src/services/recording.js`
- Create: `src/services/install.js`
- Create: corresponding `*.test.js` files

**Steps:**
1. Move all translated content and education scripts into structured local data, preserving approved wording.
2. Define language selector data, including speech locale for each language.
3. Implement a local counter service with a safe fallback of `12543`.
4. Implement speech synthesis behind a safe, testable API that cancels prior speech and reports unsupported environments.
5. Implement recording helpers that choose supported codecs, collect audio, stop media tracks, and revoke replaced object URLs.
6. Implement a deferred-install-prompt helper with iOS/manual fallback detection.
7. Write tests before each implementation, including unavailable browser APIs and permission failures.

**Programmatic Testing:** Unit tests cover all translations, counter persistence, speech invocation, recording cleanup, and installation fallback flows.

**Human Testing:** Verify correct Cantonese, Mandarin, and English device voices are selected where installed.

## Task 4: Migrate Visual Components

**Files:**
- Create: `src/components/TopBar.jsx`
- Create: `src/components/LanguageSelector.jsx`
- Create: `src/components/ModeControls.jsx`
- Create: `src/components/ActionGrid.jsx`
- Create: `src/components/VideoPanel.jsx`
- Create: `src/components/FirstAidGuide.jsx`
- Create: `src/components/InfoPanels.jsx`
- Create: `src/components/FooterLink.jsx`
- Create: component tests
- Modify: `src/App.jsx`
- Modify: `src/styles.css`

**Steps:**
1. Port current visual tokens, dimensions, spacing, border radii, shadows, typography hierarchy, and responsive sizing to `src/styles.css` without modernization.
2. Implement semantic presentational components fed entirely by props.
3. Preserve language-selector layout, action-grid colors and press depth, recording pulse, installation row, expandable panel treatment, content order, and emergency-guidance prominence.
4. Add accessibility state such as `aria-pressed` for the selected language.
5. Write tests for component rendering and callbacks before implementation.
6. Run visual snapshots at every approved baseline state and correct differences before continuing.

**Programmatic Testing:** Component tests plus Playwright screenshot comparisons against committed legacy baselines.

**Human Testing:** Compare desktop and mobile output side-by-side with legacy screenshots. Confirm no clipping, overlap, or unwanted text wrapping in every language.

## Task 5: Migrate Stateful Education And Toy Modes

**Files:**
- Create: `src/hooks/useToyRecordings.js`
- Create: `src/hooks/useToyRecordings.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/ActionGrid.jsx`
- Modify: `src/components/ModeControls.jsx`
- Modify: `src/styles.css`

**Steps:**
1. Add state for language, mode, local click count, status, and audio behavior in `App`.
2. Implement education-mode action clicks via the speech service and translated status updates.
3. Implement toy recording state: microphone request, one active recording, 60-second timeout, one recording per action, and playback.
4. Clean up media tracks, timers, playback, and object URLs on mode change and component unmount.
5. Write failing tests for each interaction and failure state before implementation.
6. Re-run visual comparisons for language selection, mode switch, active recording toggle, and pulse states.

**Programmatic Testing:** Unit tests cover state transitions, recording denial, timeout, replacement cleanup, missing audio, and playback failures. Browser tests cover primary user flows.

**Human Testing:** On Android Chrome and iOS Safari, record/play each action; confirm microphone indicators disappear on exit and speech behavior is correct with installed voices.

## Task 6: Replace Legacy PWA Assets And Test Static Output

**Files:**
- Delete: `sw.js`
- Delete: `manifest.json`
- Modify: `vite.config.js`
- Create: `tests/e2e/app.spec.js`
- Create: `tests/e2e/pwa.spec.js`
- Create: `tests/visual/react-parity.spec.js`

**Steps:**
1. Remove the legacy manual service worker and manifest only after Vite emits their replacements.
2. Test the built, served `dist/` directory, not only the development server.
3. Verify generated manifest and service worker files exist and core controls render when the external video is blocked.
4. Compare React screenshots at all committed baseline states, disabling nondeterministic animations except the explicit pulse screenshot.
5. Require human review before updating a baseline; baseline updates represent intentional visual changes only.

**Programmatic Testing:** `npm run build`, `npm run e2e`, and `npm run test:visual` pass against the built application.

**Human Testing:** Install the generated application on Android Chrome and add it to the iOS home screen. After a first successful load, launch it offline and confirm core app content renders.

## Task 7: Quality Commands, Documentation, And Final Verification

**Files:**
- Create: `Makefile`
- Create: `eslint.config.js`
- Create or modify: `README.md`
- Modify: `docs/PLAN01-react-migration.md`

**Steps:**
1. Add `make test`, `make lint`, `make build`, and `make e2e-test-full` commands required by repository policy.
2. Include visual tests in `make e2e-test-full`.
3. Document Node prerequisites, local commands, deployment of `dist/`, PWA behavior, device limitations, and session-only recordings.
4. Run the full regression set, inspect git diff/status/blame, mark completed milestones, and commit documentation.

**Programmatic Testing:**
```bash
make test
make lint
make build
make e2e-test-full
```

**Human Testing:** Verify keyboard navigation, visible focus, mobile and desktop layouts, unavailable/denied browser capabilities, installed PWA launch, and visual parity at all approved viewports.

## Acceptance Criteria

- `dist/` is static and deployable without a server runtime.
- Generated PWA assets preserve the current manifest identity and offline behavior for local application content.
- Education and toy-mode behavior preserve existing user-facing functionality.
- Recordings remain in memory for a session only.
- Browser API interactions are isolated and automated tests cover normal and failure paths.
- At each approved viewport and UI state, React output matches committed legacy baseline images within the agreed fixed-browser screenshot threshold.
- Interactive visuals preserve selected-language state, mode state, record control state, action press depth, and recording pulse.
- `make test`, `make lint`, `make build`, and `make e2e-test-full` pass.
- All development commits occur on the dedicated worktree branch; `main` is not edited or committed.
