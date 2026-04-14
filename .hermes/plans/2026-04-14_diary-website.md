# Diary Website Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a static diary website that reads markdown entries from ~/Documents/hermes/diary/ and renders them as a beautiful, browseable site.

**Architecture:** Astro static site with Tailwind CSS. Content loaded from local markdown files at build time. Organized by year/month with a clean timeline UI.

**Tech Stack:** Astro 5, Tailwind CSS 4, pnpm (via proto)

**Content Source:** ~/Documents/hermes/diary/YYYY/MM-month.md (markdown with date headings)

---

### Task 1: Scaffold Astro project

**Objective:** Create the Astro project in ~/Develop/hermes with pnpm

**Files:**
- Create: ~/Develop/hermes/ (entire project)

**Step 1:** Initialize Astro project
```bash
cd ~/Develop
pnpm create astro@latest hermes --template minimal --no-install --no-git --typescript strict
cd hermes
pnpm install
```

**Step 2:** Add Tailwind CSS
```bash
pnpm astro add tailwind --yes
```

**Step 3:** Verify dev server starts
```bash
pnpm dev
```

---

### Task 2: Create diary content integration

**Objective:** Set up Astro content collections to load diary markdown from ~/Documents/hermes/diary/

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/diary.ts` (utility to read diary entries)

The content config will define a "diary" collection that loads from `~/Documents/hermes/diary/**/*.md` using `glob` loader with custom parsing for the date-entry structure.

---

### Task 3: Build page layouts and components

**Objective:** Create the UI components and layouts

**Files:**
- Create: `src/layouts/BaseLayout.astro` (HTML shell with nav)
- Create: `src/layouts/DiaryLayout.astro` (diary page layout)
- Create: `src/components/DiaryEntry.astro` (single entry card)
- Create: `src/components/MonthNav.astro` (month sidebar/nav)
- Create: `src/components/Sidebar.astro` (year/month navigation)

Design: Clean minimal design with a left sidebar showing year/month navigation, main content area showing diary entries in a timeline/card format.

---

### Task 4: Create main pages

**Objective:** Build the site pages

**Files:**
- Modify: `src/pages/index.astro` (landing — latest entries)
- Create: `src/pages/diary/[...slug].astro` (individual month view)
- Create: `src/pages/diary/index.astro` (all diary overview)

---

### Task 5: Style and polish

**Objective:** Add Tailwind styling, responsive design, dark mode

- Typography for markdown content
- Timeline-style entry cards with date badges
- Responsive sidebar that collapses on mobile
- Dark/light mode toggle
- Smooth transitions

---

### Task 6: Add build script and verify

**Objective:** Ensure the site builds and works correctly

- `pnpm build` produces static output
- All diary entries from ~/Documents/hermes/diary/ are rendered
- Navigation between months works
- Commit all code
