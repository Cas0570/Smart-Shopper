# 🛒 Smart Shopping List

[![CI Status](https://github.com/Cas0570/Smart-Shopper/workflows/CI/badge.svg)](https://github.com/Cas0570/Smart-Shopper/actions)
[![Test Coverage](https://img.shields.io/badge/tests-189%20passing-brightgreen)](https://github.com/Cas0570/Smart-Shopper/actions)

> A modern, offline-first Progressive Web App for managing grocery shopping lists with smart features like voice input, barcode scanning, and intelligent auto-categorization.

**🌐 Live Demo:** [https://smart-shopper.casdoorn.nl](https://smart-shopper.casdoorn.nl)

---

## ✨ Key Features

### 📱 Offline-First PWA

- **Complete offline functionality** — Add, edit, and manage lists without internet
- **Service Worker with 4-tier caching** — Static assets, fonts, and navigation cached intelligently
- **Install as standalone app** — Add to home screen on mobile or desktop
- **Automatic updates** — Seamless background updates when online

### 🎤 Quick Item Entry

- **Voice input** — Add items hands-free using voice commands
- **Natural language parsing** — Say "get 2 bottles of milk" and it understands
- **Bulk text entry** — Paste or type comma-separated lists
- **Smart parsing** — Handles "a dozen eggs", "some bread", etc.

### 📸 Barcode Scanning

- **Camera-based scanning** — Use your device camera to scan product barcodes
- **Local product database** — Builds a personal database of your frequently bought items
- **Instant recognition** — Scanned products are remembered for next time
- **Manual fallback** — Can't scan? Enter product details manually

### 🏷️ Intelligent Categorization

- **Auto-categorization** — Items are automatically sorted into store sections
- **Manual learning** — Override categories and the app learns your preferences
- **Custom categories** — Create your own categories with custom icons
- **Store layout ordering** — Arrange categories to match your store's layout
- **Global preference sync** — Category preferences apply across all lists

### 📋 Multiple Lists Management

- **Create unlimited lists** — Separate lists for different stores or occasions
- **Archive old lists** — Keep completed lists out of the way
- **Duplicate lists** — Copy existing lists as templates
- **Rename lists** — Easy list organization

### 💾 Data Management

- **Local backup** — Export all data as JSON (lists, items, categories, products, preferences)
- **Restore from backup** — Import data with merge or replace options
- **Share lists** — Share via Web Share API or copy to clipboard
- **JSON export** — Download lists for external use

### 🎨 Modern UI/UX

- **Tailwind CSS 4** — Modern, responsive design
- **Mobile-optimized** — Touch-friendly interface
- **Toast notifications** — Non-intrusive feedback for all actions
- **Loading states** — Clear visual feedback during operations

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.19.0+ or 22.12.0+
- **npm** 10+ (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Cas0570/Smart-Shopper.git
   cd Smart-Shopper/smart-shopper
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start developmenet server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Seed Sample Data (Optional)

To get started quickly with sample data for testing and demonstration:

1. **Generate the sample data file**:

   ```bash
   npm run dev:seed
   ```

2. **Import into the app**:
   - Open http://localhost:5173 in your browser
   - Go to **Settings** (gear icon)
   - Click **"Import Backup"**
   - Select `public/sample-data.json`
   - Click **"Replace"** to import

This will populate your app with:

- **3 sample shopping lists**: "Weekly Groceries", "Party Supplies", and "Thanksgiving Dinner" (archived)
- **24 shopping items** across various categories
- **10 products** in the barcode database (with real barcodes for testing)
- **3 category preferences** (manual learning examples)
- **Custom category order** preset

Perfect for testing all features including voice input, barcode scanning, and categorization!

---

## 🛠️ Development

### Available Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start development server with hot-reload  |
| `npm run dev:seed`     | Seed database with sample data            |
| `npm run build`        | Build for production                      |
| `npm run preview`      | Preview production build locally          |
| `npm test`             | Run unit tests in watch mode              |
| `npm run test:ui`      | Open Vitest UI for interactive testing    |
| `npm run test:run`     | Run all tests once                        |
| `npm run type-check`   | TypeScript type checking                  |
| `npm run lint`         | Lint and auto-fix code                    |
| `npm run lint:check`   | Check lint without fixing (CI mode)       |
| `npm run format`       | Format code with Prettier                 |
| `npm run format:check` | Check formatting without fixing (CI mode) |

### Project Structure

```
smart-shopper/
├── src/
│   ├── components/        # Reusable Vue components
│   ├── composables/       # Vue composables (hooks)
│   ├── stores/           # Pinia state management
│   ├── views/            # Page components
│   ├── router/           # Vue Router configuration
│   ├── db/               # IndexedDB schema (Dexie)
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   └── __tests__/        # Unit tests
├── docs/                 # Documentation
├── public/               # Static assets (PWA icons)
└── scripts/              # Build and seed scripts
```

---

## 🧪 Testing

### Unit Tests

The project has **189 passing unit tests** with comprehensive coverage:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

**Test Coverage by Feature:**

- ✅ Voice input and speech recognition (23 tests)
- ✅ Barcode scanning and product database (41 tests)
- ✅ Auto-categorization and learning (49 tests)
- ✅ Multiple lists management (37 tests)
- ✅ Offline functionality and backup/restore (18 tests)
- ✅ Composables and utilities (21 tests)

---

## 🏗️ Tech Stack

### Core

- **[Vue 3](https://vuejs.org/)** — Progressive JavaScript framework (Composition API)
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe development (strict mode)
- **[Vite](https://vitejs.dev/)** — Fast build tool and dev server
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS framework

### State & Data

- **[Pinia](https://pinia.vuejs.org/)** — Intuitive state management
- **[Dexie.js](https://dexie.org/)** — IndexedDB wrapper for offline storage
- **[Vue Router](https://router.vuejs.org/)** — Official routing library

### PWA & Offline

- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — Zero-config PWA plugin
- **[Workbox](https://developers.google.com/web/tools/workbox)** — Service worker strategies

### Features

- **[@zxing/library](https://github.com/zxing-js/library)** — Barcode scanning
- **[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)** — Voice recognition
- **[Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)** — Native sharing

### Testing & Quality

- **[Vitest](https://vitest.dev/)** — Fast unit testing with Vue Test Utils
- **[ESLint](https://eslint.org/)** — Code linting
- **[Prettier](https://prettier.io/)** — Code formatting
- **[Husky](https://typicode.github.io/husky/)** — Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** — Pre-commit linting

---

## 📖 How to Use

### Creating Your First List

1. **Click "New List"** on the home screen
2. **Name your list** (e.g., "Weekly Groceries")
3. **Start adding items** using any of these methods:

### Adding Items

#### Method 1: Voice Input 🎤

1. Tap the **microphone button** in the list
2. Say items naturally: _"Get milk, bread, and a dozen eggs"_
3. Items are added and auto-categorized

#### Method 2: Text Entry ⌨️

1. Type items in the input field
2. Use comma-separation: _"apples, bananas, orange juice"_
3. Press Enter to add

#### Method 3: Barcode Scanner 📸

1. Tap the **scan button**
2. Allow camera access
3. Point camera at product barcode
4. Known products are added instantly
5. Unknown products can be entered manually and saved for future scans

### Managing Items

- **Check off items** — Tap to mark as purchased (moves to bottom)
- **Edit items** — Tap the edit icon to change name or category
- **Delete items** — Swipe or tap delete icon
- **Change category** — Edit and select from dropdown

### Organizing with Categories

#### Auto-Categorization

Items are automatically categorized based on keywords:

- "milk" → Dairy
- "apple" → Produce
- "chicken" → Meat & Fish
- "bread" → Bakery

#### Manual Categorization

1. **Edit an item** and change its category
2. **The app learns** your preference
3. **Future items** with similar names use your preferred category

#### Custom Categories

1. Go to **Settings**
2. Tap **"Create Category"**
3. Choose a name and icon
4. Use in any list

#### Reorder Categories

1. Go to **Settings** → **Category Order**
2. Drag categories to match your store layout
3. Your lists will display items in that order

### Working Offline

The app works completely offline after the first visit:

- ✅ All features available without internet
- ✅ Data stored locally on your device
- ✅ Syncs automatically when online (if needed)

### Backup & Restore

#### Export Backup

1. Go to **Settings**
2. Tap **"Export Backup"**
3. JSON file downloads with all data

#### Import Backup

1. Go to **Settings**
2. Tap **"Import Backup"**
3. Select JSON file
4. Choose **Merge** or **Replace**

### Sharing Lists

1. Open a list
2. Tap the **share button**
3. Choose sharing method (messages, email, etc.)
4. Recipient gets a formatted text list

---

## 🚢 Deployment

### Production Build

```bash
npm run build
```

Output is in `dist/` directory.

### Vercel Deployment

This project is configured for Vercel with PWA support:

1. **Connect GitHub repository** to Vercel
2. **Auto-deploys** on every push to main
3. **Preview deployments** for pull requests
4. **Custom domain** configured

---

## 👤 Author

**Cas Doorn**

- GitHub: [@Cas0570](https://github.com/Cas0570)
- Website: [casdoorn.nl](https://casdoorn.nl)

---

## 🙏 Acknowledgments

- Built as part of a Saxion Associate Degree Software Development project
