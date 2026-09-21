# Lingui Localization Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move all user-visible text from React source into Lingui-managed translation catalogs for Traditional Chinese, Simplified Chinese, and English while preserving current language selection, speech locale behavior, and static PWA deployment.

**Architecture:** Lingui provides the React translation runtime and extracts stable message IDs into checked-in catalogs. `src/i18n/config.js` owns locale metadata that is not user-facing copy, and the application loads the active compiled catalog locally from the static Vite bundle. Components use semantic message IDs through `t` or `<Trans>`; all prose, status templates, aria labels, and browser alert content move out of `App.jsx`.

**Tech Stack:** React, Vite, Lingui (`@lingui/core`, `@lingui/react`, `@lingui/macro`, `@lingui/cli`), Vitest, React Testing Library, Playwright, ESLint.

---

## Scope And Constraints

- Retain the existing `zh-HK`, `zh-CN`, and `en` selectors and default `zh-HK` locale.
- Keep catalogs in the repository and compile them into the static PWA. Do not add a translation SaaS, remote catalog loading, or a backend.
- Preserve approved user-visible wording unless separately approved by the Foundation.
- Move all user-visible copy from `src/App.jsx`, including headings, long-form guidance, FAQ, dynamic statuses, installation fallbacks, aria labels, image alternate text, link labels, and video labels.
- Do not translate stable technical metadata such as locale codes, speech-synthesis locale codes, asset URLs, mode values, CSS classes, test IDs, or browser API capability identifiers.
- Use explicit semantic message IDs; do not use English source text as message IDs.
- Keep dynamically formatted text interpolation-safe, for example `status.recording` with an `id` placeholder.

## Risks And Decisions

- This repository currently mixes translation data, language metadata, and UI copy across `src/data/*.js` and `src/App.jsx`. The migration must preserve all existing language variants before deleting the legacy data modules.
- Rich first-aid guidance contains emphasis and lists. Keep that document structure in React and translate individual text nodes or use Lingui's rich-text `<Trans>` support. Do not reintroduce `dangerouslySetInnerHTML` for translated content.
- `lingui extract` only discovers messages represented through Lingui calls/macros. A catalog completeness test should verify every supported locale defines each extracted message after compilation.
- Lingui's generated catalog files are source-controlled; compiled catalogs are build artifacts and remain ignored through `dist/`.
- The migration should occur after the current React migration branch has a clean baseline. This task belongs on the existing `feature/react-migration` branch only if the user approves combining it with that work; otherwise create a new dedicated worktree as required by `AGENTS.md`.

## Proposed Catalog Layout

```text
src/
  i18n/
    config.js             # APP_LOCALES, selector labels, speech locales; no prose
    setup.js              # I18n instance and local catalog activation
    locales/
      en.po
      zh-HK.po
      zh-CN.po
```

Use PO catalogs because Lingui supports them natively, they preserve translator comments and message context, and they are compatible with common translation tooling. The generated catalogs use stable IDs such as:

```po
msgctxt "status.recording"
msgid "Recording on button {id}... (Max 60s)"
msgstr ""
```

The initial source locale should be English because Lingui needs one canonical default message for extraction. This does not change the default displayed locale: the application continues activating `zh-HK` at startup.

## Task 1: Add Lingui Tooling And Catalog Configuration

**Files:**
- Modify: `package.json`
- Create: `lingui.config.js`
- Create: `src/i18n/config.js`
- Create: `src/i18n/setup.js`
- Create: `src/i18n/setup.test.js`
- Modify: `src/main.jsx`

**Step 1: Write failing locale activation tests**

Create `src/i18n/setup.test.js` with assertions that the default app locale is `zh-HK`, each selector code maps to its expected speech locale, and activating a supported catalog changes the Lingui locale.

```js
import { expect, test } from 'vitest';
import { APP_LOCALES, activateLocale, i18n } from './setup';

test('starts in Traditional Chinese', () => {
  expect(i18n.locale).toBe('zh-HK');
});

test('maps selector locale to its speech locale', () => {
  expect(APP_LOCALES.en.speechLocale).toBe('en-US');
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/i18n/setup.test.js
```

Expected: FAIL because the i18n modules do not exist.

**Step 3: Add Lingui dependencies and scripts**

Install compatible current versions of:

```bash
npm install @lingui/core @lingui/react
npm install --save-dev @lingui/cli @lingui/vite-plugin
```

Import macros from the version-matched `@lingui/core/macro` and
`@lingui/react/macro` subpaths rather than installing the separate
`@lingui/macro` package.

Add scripts:

```json
{
  "i18n:extract": "lingui extract",
  "i18n:compile": "lingui compile",
  "i18n:check": "lingui extract --overwrite && lingui compile"
}
```

**Step 4: Configure Lingui and Vite**

Create `lingui.config.js`:

```js
export default {
  sourceLocale: 'en',
  pseudoLocale: undefined,
  locales: ['en', 'zh-HK', 'zh-CN'],
  catalogs: [{ include: ['src'], path: '<rootDir>/src/i18n/locales/{locale}' }],
  format: 'po',
};
```

Add Lingui's Vite plugin before the React plugin in `vite.config.js`.

Create `src/i18n/config.js`:

```js
export const DEFAULT_LOCALE = 'zh-HK';

export const APP_LOCALES = {
  'zh-HK': { selectorLabel: '繁體', speechLocale: 'zh-HK' },
  'zh-CN': { selectorLabel: '简体', speechLocale: 'zh-CN' },
  en: { selectorLabel: 'EN', speechLocale: 'en-US' },
};
```

Create `src/i18n/setup.js` that activates static local catalogs. Prefer explicit static imports for three catalogs over asynchronous dynamic imports because all three are small, known at build time, and must work offline immediately.

Wrap the application in `I18nProvider` in `src/main.jsx`.

**Step 5: Run extraction and compile**

Run:

```bash
npm run i18n:extract
npm run i18n:compile
```

Expected: initial PO catalog files exist and compile without untranslated-message failures.

**Step 6: Run unit tests and build**

Run:

```bash
npm test -- src/i18n/setup.test.js
npm run build
```

Expected: PASS.

**Step 7: Commit**

```bash
git add package.json package-lock.json lingui.config.js vite.config.js src/i18n src/main.jsx
git commit -m "chore: configure Lingui catalogs"
```

## Task 2: Convert Short UI Copy And Dynamic Statuses

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/data/educationSteps.js`
- Delete: `src/data/translations.js` after all its consumers are migrated
- Modify: `src/i18n/locales/en.po`
- Modify: `src/i18n/locales/zh-HK.po`
- Modify: `src/i18n/locales/zh-CN.po`

**Step 1: Write failing interaction tests in two languages**

Add tests that select English and Traditional Chinese, trigger an education action, and assert the translated dynamic status is rendered. Test interpolation with a button identifier.

```jsx
test('renders the translated recording status with its action identifier', async () => {
  // Select toy mode and activate record mode with mocked browser APIs.
  expect(screen.getByText('Recording on button 1... (Max 60s)')).toBeInTheDocument();
});
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
npm test -- src/App.test.jsx
```

Expected: FAIL because the status is still driven by inline strings or old translation data.

**Step 3: Replace short text with Lingui messages**

In `App.jsx`, import `t` and `Trans` from Lingui. Replace every user-visible header, control label, action label, status, alert, image alt text, aria label, video title/label, and footer link string.

Examples:

```jsx
const status = t({ id: 'status.educationDefault', message: 'Education Mode: Click buttons for instructions.' });

setStatus(t({
  id: 'status.recording',
  message: 'Recording on button {id}... (Max 60s)',
  values: { id },
}));
```

Use `APP_LOCALES[locale].speechLocale` when constructing speech utterances. Do not translate locale metadata.

Move labels currently in `translations.js` and `educationSteps.js` into Lingui messages. Keep education step IDs stable, for example `education.step1` through `education.step4`.

**Step 4: Extract, translate, and compile**

Run:

```bash
npm run i18n:extract
```

Fill `zh-HK.po` and `zh-CN.po` from existing approved content. Validate that all entries are translated, then run:

```bash
npm run i18n:compile
```

**Step 5: Run unit tests and build**

Run:

```bash
npm test -- src/App.test.jsx
npm run build
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/data src/i18n/locales
git commit -m "feat: localize controls and status messages"
```

## Task 3: Convert Rich Guidance, Setup, And FAQ Content

**Files:**
- Modify: `src/App.jsx`
- Create: `src/components/TranslatedRichText.jsx` only if repeated formatting cannot be expressed with `<Trans>` directly
- Modify: `src/i18n/locales/en.po`
- Modify: `src/i18n/locales/zh-HK.po`
- Modify: `src/i18n/locales/zh-CN.po`
- Modify: `src/App.test.jsx`

**Step 1: Write failing language-switch coverage for long content**

Test that switching languages changes the setup heading, at least one first-aid instruction, the FAQ question, and the footer label. Open the relevant `details` panels before asserting their content.

**Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/App.test.jsx
```

Expected: FAIL because long content remains inline English or Chinese source text.

**Step 3: Convert rich markup with Lingui `<Trans>`**

Use semantic IDs and component placeholders where emphasis is required:

```jsx
<Trans id="guide.stay" comment="Seizure first-aid step one">
  <strong>STAY:</strong> Stay calm and time the seizure.
</Trans>
```

For multi-item setup, explainer, and FAQ content, keep HTML structure in React and use one translation message per heading, paragraph, or list item. Do not use a single raw HTML translation message. This lets translators change prose without gaining control over application markup.

**Step 4: Extract and carry forward all approved text**

Run `npm run i18n:extract`; fill all three PO files from current approved strings. Confirm all entries are translated and no old conditional `language ===` prose branches remain in `App.jsx`.

**Step 5: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/components src/i18n/locales
git commit -m "feat: move guidance content into Lingui catalogs"
```

## Task 4: Add Catalog Validation And Extraction Workflow Tests

**Files:**
- Create: `src/i18n/catalogs.test.js`
- Modify: `package.json`
- Modify: `Makefile`
- Modify: `README.md`

**Step 1: Write failing catalog tests**

Test that:

- `APP_LOCALES` has exactly `en`, `zh-HK`, and `zh-CN`.
- All catalogs expose translations for extracted message IDs.
- No catalog contains an empty translation for a required non-source locale.

Use the compiled Lingui catalogs, not a duplicate manually maintained key list.

**Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/i18n/catalogs.test.js
```

Expected: FAIL until catalog inspection helpers exist.

**Step 3: Implement only the required validation helper**

Add a test-only loader for compiled catalogs. It must report missing/empty values in a useful assertion message. Do not add a separate translation framework or duplicate catalog schema.

**Step 4: Add quality commands**

Add `i18n:check` as a prerequisite for build/release verification:

```make
i18n-check:
	npm run i18n:check

test:
	npm run i18n:check
	npm test
```

If extraction updates committed PO files during normal developer work, document the expected sequence:

```bash
npm run i18n:extract
# Translate changed entries.
npm run i18n:compile
make test
```

**Step 5: Run validation, tests, and lint**

Run:

```bash
npm run i18n:check
make test
make lint
```

Expected: PASS without generated catalog changes left unstaged.

**Step 6: Commit**

```bash
git add Makefile README.md package.json src/i18n/catalogs.test.js src/i18n
git commit -m "test: validate Lingui catalogs"
```

## Task 5: Browser, PWA, And Visual Regression Verification

**Status:** Pending manual acceptance; automated browser, PWA, and visual verification completed 2026-09-21.

**Files:**
- Modify: `tests/e2e/app.spec.js`
- Modify: `tests/visual/react-parity.spec.js`
- Modify: `docs/plans/2026-09-21-react-migration.md` only after all verification passes

**Step 1: Add browser language-flow tests**

Extend Playwright tests to switch each language, assert a short translated label plus a long-form panel heading, and confirm education actions render the matching status.

**Step 2: Add visual language-state coverage**

Add fixed-viewport screenshots for Traditional Chinese, Simplified Chinese, and English. Continue masking the externally hosted YouTube iframe. Use a committed Playwright baseline only after human review.

**Step 3: Run static PWA and visual verification**

Run:

```bash
make build
npm run e2e
npm run test:visual
```

Expected: PASS against the built static output.

**Step 4: Perform manual acceptance checks**

- Change language in a desktop browser and a narrow mobile viewport.
- Confirm long guidance, FAQ, setup instructions, recording statuses, and install fallback dialogs use the selected language.
- Confirm text-to-speech retains `zh-HK`, `zh-CN`, and `en-US` browser speech locales.
- Install the built PWA and confirm all catalogs load offline after the first successful installation.

**Step 5: Update migration documentation and commit**

Inspect `git diff`, `git status`, and `git blame` as required by `docs/SPEC.md`. Mark the relevant completed milestones and record the exact verification result in `docs/plans/2026-09-21-react-migration.md`.

```bash
git add tests docs/plans/2026-09-21-react-migration.md
git commit -m "test: verify localized static PWA"
```

**Verification record (2026-09-21):**

- `make build`: PASS; production static PWA built successfully.
- `npm run e2e`: PASS; 6 Playwright tests passed.
- `npm run test:visual`: PASS; 3 fixed-viewport localized visual snapshot tests passed with the YouTube iframe masked.
- `make e2e-test-full`: PASS; reran the 6 E2E and 3 visual tests successfully.

**Outstanding manual acceptance checks:**

- Change language in desktop and narrow mobile viewports; confirm the selected language is applied.
- Confirm text-to-speech uses `zh-HK`, `zh-CN`, and `en-US` browser speech locales.
- Install the built PWA and confirm all catalogs load offline after the first successful installation.

Task 5 remains pending these manual checks. Task 6 and final Lingui migration review also remain outstanding.

## Acceptance Criteria

- No user-visible prose or language-specific conditionals remain in React component source.
- `src/i18n/locales/en.po`, `zh-HK.po`, and `zh-CN.po` contain all application copy and compile successfully.
- Application behavior and browser capabilities use a non-translated locale metadata map.
- Dynamic messages use Lingui interpolation with named values, not concatenated strings.
- Text structure and markup are rendered by React; translators edit text rather than raw HTML.
- `npm run i18n:extract`, `npm run i18n:compile`, `make test`, `make lint`, `make build`, and `make e2e-test-full` pass.
- Browser tests cover all three languages against the production static build.
- The generated PWA remains usable offline after installation, including all bundled translations.
