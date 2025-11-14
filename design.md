# PWA Design: Smart Shopping List

## Project Summary

A Progressive Web App for managing grocery shopping lists with offline support, barcode scanning, voice input, and intelligent categorization. The app helps users organize their shopping trips efficiently by remembering purchase patterns and organizing items by store layout.

## Job Stories

Note: each Rule subsection below is written as a testable acceptance criterion (Given / When / Then). During implementation every Rule should become an automated E2E test.

### Story 1: Quick Item Entry While Cooking

**When** I'm cooking dinner and realize I'm running low on ingredients,
**I want to** quickly add items to my shopping list without typing,
**so that** I don't forget what I need while my hands are messy or busy.

#### Rule 1.1: Voice input creates new items

**Examples:**

- Given I use voice input and say "Milk" → Then "Milk" is added to my list in the Dairy category
- Given I say "Add bananas and apples" → Then both items are added to the Produce category
- Given voice recognition fails → Then I see an error message and can retry or type manually

#### Rule 1.2: Quick text entry

**Examples:**

- Given I type "Milk" into the quick-add field → Then "Milk" is added to the active list and categorized
- Given I paste a comma-separated list "eggs, flour, sugar" → Then three items are created and categorized where possible

#### Rule 1.3: Hands-free entry using shortcuts

**Examples:**

- Given the app is installed and in standalone mode → When I long-press the app icon (if supported) → Then it opens directly to quick-add

#### Rule 1.4: Error handling for quick entry

**Examples:**

- Given I speak while background noise is high → When speech recognition returns low confidence → Then the app shows a confirmation dialog with parsed items before adding
- Given I paste malformed text into quick-add → Then the app sanitizes and splits items correctly or asks for confirmation

### Story 2: Offline Shopping in Store

**When** I'm shopping in a grocery store with poor cellular reception,
**I want to** access and check off my shopping list without internet connectivity,
**so that** I can complete my shopping efficiently without waiting for pages to load.

#### Rule 2.1: Offline access and edits

**Examples:**

- Given I create a list with 10 items → When I go offline → Then all 10 items are still visible and editable
- Given I'm offline and add 3 items → When I go back online → Then all items are still there (no sync needed as it's local-only)
- Given I'm offline → When I check off items → Then the changes persist when reopening the app

#### Rule 2.2: Graceful feature degradation

**Examples:**

- Given I'm offline and try to use a cloud-only feature (e.g., syncing) → Then I see a clear message stating the feature needs network access

#### Rule 2.3: Local backup and restore

**Examples:**

- Given I export my lists to a local file → Then I can import them back and all items and categories restore correctly
- Given app data is cleared accidentally → When I import the backup file → Then lists restore and items keep categories and completed state

### Story 3: Organized Shopping by Category

**When** I walk through the grocery store following its layout,
**I want to** see my shopping list organized by store sections (produce, dairy, frozen, etc.),
**so that** I don't have to backtrack through the store and save time.

#### Rule 3.1: Auto-categorization

**Examples:**

- Given I add "Milk" to my list → Then it appears in the "Dairy" category
- Given I add "Tomatoes" to my list → Then it appears in the "Produce" category
- Given I add "Unknown Item XYZ" → Then it appears in the "Other" category

#### Rule 3.2: Manual categorization and learning

**Examples:**

- Given I move "Milk" from Dairy to Beverages → Then the app saves my preference and future "Milk" entries use Beverages

#### Rule 3.3: Category ordering and store layout

**Examples:**

- Given I choose a store layout in Settings → Then the list groups categories in the chosen order (e.g., Produce → Bakery → Dairy)
- Given I change category sort order → Then the UI reflects the new order immediately

### Story 4: Quick Barcode Scanning

**When** I want to add a specific product I've purchased before,
**I want to** scan its barcode to add it instantly,
**so that** I don't have to type out the full product name.

#### Rule 4.1: Local barcode lookup

**Examples:**

- Given I scan a known barcode → Then the product name is added to my list in the correct category
- Given I scan an unknown barcode → Then I can manually enter the product name and category and it is saved locally
- Given camera access is denied → Then I see a helpful message and fallback to manual entry

#### Rule 4.2: Build local product database

**Examples:**

- Given I scan and save 20 products → Then subsequent scans return results instantly from local DB

#### Rule 4.3: Barcode scan UX and fallback

**Examples:**

- Given camera permission is granted → When I open scanner → Then camera stream starts and a scanning UI is shown
- Given scanning times out → Then user can enter barcode manually or retry scan

### Story 5: Multiple Lists Management

**When** I'm planning both weekly groceries and a special party,
**I want to** maintain separate shopping lists,
**so that** I can keep different shopping purposes organized and clear.

#### Rule 5.1: Multiple lists CRUD

**Examples:**

- Given I create two lists "Weekly" and "Party" → Then items added to "Weekly" do not appear in "Party"
- Given I archive a list → Then it appears in the Archived section and no longer shows as active

#### Rule 5.2: Share and export

**Examples:**

- Given I hit Share on a list → Then the native share dialog opens with list contents as text

#### Rule 5.3: Rename and duplicate lists

**Examples:**

- Given I duplicate "Weekly" → Then a copy "Weekly (copy)" is created with the same items
- Given I rename "Party" to "Birthday Party" → Then the new name persists and is reflected in the Home view

## Domain Model

```plantuml
!include https://sd42.nl/static/style-light.plantuml

entity "ShoppingList" as List {
  *id: string (UUID)
  *name: string
  *createdAt: timestamp
  *updatedAt: timestamp
  archived: boolean
  color: string
}

entity "ShoppingItem" as Item {
  *id: string (UUID)
  *name: string
  *quantity: number
  unit: string
  *category: string
  completed: boolean
  *addedAt: timestamp
  completedAt: timestamp
  barcode: string
  notes: string
}

entity "Category" as Category {
  *id: string
  *name: string
  icon: string
  sortOrder: number
}

entity "Product" as Product {
  *barcode: string
  *name: string
  *category: string
  lastUsed: timestamp
}

List ||--o{ Item : "contains"
Item }o--|| Category : "belongs to"
Product }o--|| Category : "defaults to"

note right of List
  Each list is independent.
  Users can have multiple active lists.
  Archived lists are kept for history.
end note

note right of Item
  Quantity defaults to 1.
  Category is auto-assigned based
  on product name or barcode lookup.
end note

note left of Product
  Stores known products from
  barcode scans for future use.
  Acts as a local product database.
end note
```

## Low Fidelity Prototype

The low-fidelity prototype is available as simple, linkable HTML "wiretext" pages in the `prototype/` folder. Open `prototype/index.html` in a browser to navigate.

Files provided:

- `prototype/index.html` — Home / List Overview
- `prototype/list.html` — Shopping list detail
- `prototype/detail.html` — Item edit
- `prototype/scanner.html` — Barcode scanner modal (mock)
- `prototype/voice.html` — Voice input mock
- `prototype/README.md` — How to open and use the prototype

Open the prototype locally (double-click or use `xdg-open prototype/index.html`) and click through the flows.

### Navigation Flow

```
Home → List Overview → List Detail
  ├→ Add Item (Text)    [Quick-add field]
  ├→ Add Item (Voice)   [Voice modal → confirm parsed items]
  └→ Add Item (Barcode) [Scanner modal → manual fallback]
  ↓
Archive / Create New List
  ↓
Settings (Categories, Theme, Export/Import)
```

Notes: the prototype HTML in `prototype/` follows this flow. Each navigation step maps to a Rule in `design.md` and should be covered by at least one automated test.

## Offline-First Strategy

### Service worker & caching strategy (practical)

- App shell (HTML/CSS/JS, icons) — Cache-First (serve instantly from cache)
- API-like scripts/resources (e.g., translations, optional remote libs) — Network-First with Cache fallback
- Static assets (images, fonts) — Cache-First with versioned cache keys
- Data (lists, items, products, prefs) — Stored exclusively in IndexedDB (never relied on network)

Testing notes:

- Use Playwright to emulate offline by disabling network (context.setOffline(true)) and verify app shell and IndexedDB UI still work.
- Clear IndexedDB in tests to assert fresh-state behaviors; provide a test fixture that seeds sample lists.

### Data Persistence

- **IndexedDB (Dexie.js)**: Primary storage for shopping lists, items, categories, scanned products, and user preferences
- **localStorage**: Lightweight UI preferences (theme, onboarding dismissed)
- **File export/import (JSON)**: Allows backup and restore (used in Rule 2.3)

### Offline Capabilities (acceptance criteria)

- All CRUD operations must work while offline and persist to IndexedDB immediately
- The UI must not crash when network is unavailable; any network-only action shows a helpful message
- Voice and camera flows must have clear fallbacks so the core flow (add item) still works without those APIs

## Device Integration & OS Features (testing-focused)

For each Web API include a short testing strategy so tests are deterministic and runnable in CI:

1. Web App Manifest
   - Test: manifest exists with correct properties (name, icons, display)

2. Camera API (Barcode Scanning)
   - Implementation: use getUserMedia() + ZXing/QuaggaJS decoding
   - Test approach: unit-test barcode-decoding logic with stored image samples; in E2E, test the scanner UI flow and the manual-code fallback. If camera stream isn't available in CI, mock the decoder return value.

3. Web Speech API (Voice Input)
   - Implementation: use SpeechRecognition where available; parse returned transcript to items
   - Test approach: do not rely on an actual microphone in CI — unit-test the parsing function and E2E-test the UI by mocking window.SpeechRecognition or injecting transcripts into the handler; verify confirmation dialog appears and items are added on confirm.

4. Vibration API
   - Graceful degradation: check for navigator.vibrate existence before calling
   - Test: verify that the vibrate call is invoked when available (unit test with a mock navigator)

5. Share API
   - Test: verify that the share fallback (copy to clipboard) works if navigator.share is unavailable in the environment

6. Notifications API (optional)
   - Test: run permission-flow UI; in CI assert the UI shows correct permission prompt state (do not grant real notifications)

## Progressive Enhancement & Responsive Design (testing)

- Include visual/layout checks in Playwright by verifying key pages at mobile/tablet/desktop viewports
- Include keyboard and touch interaction tests (e.g., Space to toggle item, swipe to delete can be covered by invoking the handler directly or using pointer events)

## Technology Stack (reminder)

- Vue 3 (Composition API), Pinia, Vue Router, TypeScript
- Dexie.js for IndexedDB
- Vite + Vite PWA plugin + Workbox
- Playwright for E2E and unit tests with Vitest/Jest for logic

## Testing & Test Coverage (rules → tests)

Every Rule in `design.md` is an acceptance test. Track coverage in `PROGRESS.md` with a table: Rule ID → Test file/spec → Status → Last run result.

Example E2E test mapping (minimum):

1. Rule 1.1 (Voice input creates new items) → `tests/e2e/voice.spec.ts` (mock SpeechRecognition, verify parsed items and confirm)
2. Rule 2.1 (Offline access and edits) → `tests/e2e/offline.spec.ts` (seed IndexedDB, setOffline(true), verify CRUD)
3. Rule 4.1 (Local barcode lookup) → `tests/e2e/scanner.spec.ts` (mock decoder, verify saved product lookup)

### Example E2E testing notes

- For voice: mock the transcript and call the same handler the real SpeechRecognition would call; assert UI confirmation and IndexedDB writes.
- For barcode: unit-test decoder with sample images; in E2E, mock decoder result and verify UI flow including manual fallback.
- For offline: use Playwright's offline mode and ensure app shell loads from cache and data is read from IndexedDB.

## End-to-End Test Cases (based on Rule IDs)

Below are concise E2E test cases that map directly to rules in `design.md`. Each should be converted into an automated spec and tracked in `PROGRESS.md`.

1. Add & categorize (Rule 3.1)
   - Add "Milk" → expect Dairy
   - Add "Tomatoes" → expect Produce

2. Complete items (Rule B)
   - Create 5 items → check 2 → expect "2 of 5 complete"
   - Check all → expect completion UI and archive suggestion

3. Voice input (Rule 1.1)
   - Mock transcript "Milk" → confirm add (Dairy)
   - Mock transcript "Add bananas and apples" → confirm two items added (Produce)
   - Mock low-confidence → expect confirmation dialog and no immediate add until confirmed

4. Offline persistence (Rule 2.1)
   - Seed lists, go offline → verify lists and edits persist
   - Add items offline → restart app → items still present

5. Barcode scanning (Rule 4.1 / 4.2)
   - Mock decoder returns known barcode → product added with category
   - Unknown barcode → manual entry saved to local DB

6. Responsive layout (Rule 6)
   - Viewports: 375×812 (mobile), 768×1024 (tablet), 1440×900 (desktop) → key elements visible and usable

7. Multiple lists (Rule 5.1)
   - Create two lists, add items, archive one → verify independence and archived state

## Implementation Scope (24 hours)

The implementation plan stays the same; for testing: prioritize converting each Rule to a minimal, passing E2E spec. Early deployments should include at least one passing test per major user flow.

### Day 1 (8 hours): Core Functionality + test scaffolding

- Project setup, Dexie schema, Pinia store, basic CRUD
- Add a test fixture and one Playwright spec that seeds IndexedDB and verifies a simple list flow

### Day 2 (8 hours): PWA features + API mocks for tests

- Service worker, manifest, scanner UI, voice UI
- Implement mocks for SpeechRecognition and barcode decoder used in E2E tests

### Day 3 (8 hours): Polish, E2E expansion, deploy

- Finish E2E specs (cover all Rule IDs), cross-browser checks, deploy to Vercel or Netlify

## Success Criteria

- ✅ All Rule IDs have at least one automated test mapped in `PROGRESS.md`
- ✅ App shell loads from cache and core flows work offline
- ✅ Voice and barcode features have deterministic tests (mocked in CI)
- ✅ Responsive and accessible across supported viewports
- ✅ Deployed and reachable for teacher review

1. Workflow / confirmations

(A) Confirm after every objective before continuing

(B) Continue automatically unless an error occurs

(C) Confirm after every step with “Continue / Error / Changes” flow (like your previous assignment)
→ Choose one

2. Version control / commits

(A) Commit after every major component or feature (default)

(B) Commit after each objective (larger commits)

(C) Commit after every code edit (many small commits)
Optional: specify branch naming + commit message format (e.g., feat/obj1-core, conventional commits yes/no)

3. Testing / linting

(A) Run lint + unit tests automatically after each step

(B) Only run E2E tests after milestone or objective

(C) Manual testing on demand
→ pick one; also note: fail-fast on test errors (yes/no)?

4. Coding conventions

TypeScript strict mode: true / false

State management: Pinia (default) / Vuex / composables

Styling: Tailwind / scoped CSS / SASS

Formatting: ESLint + Prettier autofix (yes/no)

5. Component structure

Split components > how many lines? (e.g., 150)

Use child components for list header, item row, scanner modal, etc.? (yes/no)

Prop-down / emit-up pattern enforced? (yes/no)

6. PWA and offline

Use vite-plugin-pwa + Workbox (yes/no)

Create service-worker.ts with cache strategies from design.md (yes/no)

Enable “Add to Home Screen” (manifest + icons) (yes/no)

7. Testing stack

Unit tests: Vitest or Jest?

E2E: Playwright (default)

Coverage threshold? (e.g., 80%)

8. Deployment & CI

Deploy to Vercel / Netlify / GitHub Pages?

GitHub Actions CI for lint + tests (yes/no)

Auto-preview builds for PRs (yes/no)

9. Documentation

Generate PROGRESS.md table automatically (yes/no)

Update README.md after each milestone (yes/no)

10. Safety rules

Copilot can modify existing files (yes/no)

Should always create a backup commit before risky edits (yes/no)

11. Visual design

Should Copilot follow your own style (Satoshi font, Velto-like clean minimal) or have full freedom?

Dark/light theme support? (yes/no)

12. Extras

Generate screenshots / preview build after each major feature (yes/no)

Accessibility checks (WCAG AA via Playwright-axe) (yes/no)
