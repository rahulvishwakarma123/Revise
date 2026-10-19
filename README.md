# Project Revise — DSA Revision Tracker

A portfolio-quality MERN stack application built for **active recall** and **spaced repetition** interview preparation.

Unlike standard LeetCode spreadsheets or problem counters, **Project Revise** is designed around cognitive retention: tracking mental models, recognition signals, spaced intervals (1d → 3d → 7d → 14d → 30d → 365d), pattern recognition audit scores, and concrete mistake journals.

---

## 🌟 Key Features

### 1. High-Yield Revision Dashboard
- **Top Summary Metrics**: Total patterns, patterns revised this week, patterns due today, weak patterns remaining, independent problems solved, and interview readiness completion %.
- **Retention & Spaced Forecast Charts**: 7-day workload forecast bar chart powered by Recharts + Confidence distribution donut chart.
- **Pattern Recognition Audit**: 4-question self-audit score tracking (% of problems where you identified pattern, derived brute force, optimized Big-O, and implemented without hints).
- **Streak Tracker**: Tracks daily active recall consistency with streaks.

### 2. DSA MindMap Pattern Library
- Structured directly from [DSA MindMap](https://dsamindmap.com/) covering:
  - **Arrays**: Fixed Window, Expand-Shrink, Converging Two Pointers, Prefix Sum, Kadane's, Binary Search on Answer, Intervals, Cyclic Sort
  - **Linked Lists**: Floyd's Cycle Detection, In-Place Reversal, Reversing K-groups
  - **Stack & Queue**: Monotonic Stack, Parentheses Matching, Monotonic Deque
  - **Trees & BST**: DFS Traversal, BFS Level-Order, BST In-Order properties
  - **Backtracking & Recursion**: Subsets, Permutations, N-Queens Constraint Search
  - **Heap / Priority Queue**: Top K Elements, Two Heaps for Median
  - **Graphs**: BFS / DFS, Kahn's Topological Sort, Dijkstra's Shortest Path, Disjoint Set Union (DSU)
  - **Dynamic Programming**: 1D Linear DP, 0/1 & Unbounded Knapsack, LCS String DP, LIS Patience Sorting
  - **Greedy**: Interval Scheduling, Jump Game
  - **Bit Manipulation**: XOR cancellation, Power of 2 tricks
  - **Trie**: Prefix Tree, Word Search
- Each pattern includes:
  - Mental model & core intuition
  - Recognition signals ("the tells in an interview")
  - Big-O time and space bounds
  - Critical edge cases to guard against
  - Canonical benchmark LeetCode problems with direct links

### 3. Active Recall Sessions (Flashcard Flow)
- **Step 1: Test Memory**: Prompt to explain the pattern's intuition and edge cases without notes.
- **Step 2: Reveal & Compare**: Check against the model intuition, recognition signals, and canonical problems.
- **Step 3: Rate & Auto-Schedule**:
  - *Could not solve independently* → Next revision: **Tomorrow (1 day)**, Confidence: **Weak**
  - *Solved with a hint* → Next revision: **In 2–3 days**, Confidence: **Medium**
  - *Solved independently* → Next revision: **In 7 days**, Confidence: **Strong**
  - *Consistently strong* → Progressively expands: **14d → 30d → 60d → 90d → 180d → 365 days**

### 4. Guided 60-Minute Revision Routine Player
Built-in interactive countdown player with audio chime notifications for the 4-step routine:
1. **10 min — Recall the Pattern**: Explain intuition, signals, and complexity without notes.
2. **35 min — Solve Problems**: Attempt 2–3 suitable problems without looking at solutions.
3. **10 min — Review Mistakes**: Identify the exact reason you struggled and write down the rule.
4. **5 min — Update Tracker**: Record confidence and schedule your next spaced revision.

### 5. Practice Problem Tracker & Recognition Audit
- Problem Title, Platform Link, Topic, and Pattern.
- Difficulty (Easy, Medium, Hard) and Solution Status (Independent, With Hints, Unsolved).
- **"Solved without AI or hints?"** toggle.
- Time taken (minutes) and attempts count.
- **The 4-Question Pattern Recognition Checklist**:
  1. *Did I identify the pattern correctly?*
  2. *Could I derive the brute-force approach?*
  3. *Could I optimize it?*
  4. *Could I implement and dry-run without help?*

### 6. Mistake Journal & Pre-Interview Cheat Sheet
- Logs bugs into structured categories: *Wrong boundary*, *Wrong pattern*, *Implementation bug*, *Off-by-one*, *Missed constraint*, *Integer overflow*, *TLE / Suboptimal*.
- Captures: **Problem**, **The Mistake**, and **The Actionable Rule**.
- **Pre-Interview Cheat Sheet Mode**: Rapid 10-minute high-yield summary view before contests or technical interviews.

### 7. Dual-Layer Data Persistence
- **MongoDB + Mongoose Backend**: Full REST API (`/api/patterns`, `/api/problems`, `/api/mistakes`, `/api/sessions`, `/api/stats`).
- **Offline-First LocalStorage Fallback**: App seamlessly saves and runs in browser if MongoDB is offline.
- **Export & Import JSON**: Download or restore backup files at any time.
- **Dark & Light Mode**: Theme toggle with tailored developer palette.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18/19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Lucide React, Glassmorphism |
| **Charts** | Recharts (Responsive Bar Chart & Pie Chart) |
| **Backend** | Node.js, Express (ESM), TypeScript |
| **Database** | MongoDB, Mongoose ODM |
| **Animations** | Canvas Confetti, CSS Transitions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/dsa_revision_tracker`) or MongoDB Atlas.

### 1. Install Dependencies
```bash
# In the root folder
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Seed the DSA MindMap Patterns
Populate MongoDB with the 32 curated patterns, sample problems, and mistake logs:
```bash
npm run seed
```

### 3. Run Both Frontend and Backend Concurrently
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📁 Project Structure

```
Project Revise/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Badges, Modals, Export/Import
│   │   │   ├── dashboard/    # MetricCards, DueTodayBanner, RetentionChart, TopicMasteryList
│   │   │   ├── layout/       # Navbar, Sidebar
│   │   │   ├── mistakes/     # MistakeJournalView, MistakeModal, PreInterviewCheatSheet
│   │   │   ├── problems/     # ProblemTrackerView, ProblemModal (Recognition Audit)
│   │   │   ├── roadmap/      # RoadmapView, TopicAccordion, PatternCard, PatternModal
│   │   │   ├── scheduler/    # SchedulerView (Automated Spaced Columns)
│   │   │   └── session/      # ActiveRecallModal, RevisionRoutineTimer (60-min Player)
│   │   ├── context/          # AppContext, ThemeContext
│   │   ├── data/             # initialData.ts (Fallback offline seed)
│   │   ├── services/         # api.ts (Dual sync), scheduler.ts (Spaced Repetition Engine)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/           # db.ts (Mongoose connection)
│   │   ├── data/             # seedPatterns.ts, seedProblems.ts, seedMistakes.ts, seed.ts
│   │   ├── models/           # Pattern.ts, Problem.ts, Mistake.ts, RevisionSession.ts
│   │   ├── routes/           # patternRoutes.ts, problemRoutes.ts, mistakeRoutes.ts, statsRoutes.ts
│   │   └── server.ts         # Express server entry point
│   ├── .env
│   └── tsconfig.json
└── package.json              # Root runner scripts (concurrently)
```
