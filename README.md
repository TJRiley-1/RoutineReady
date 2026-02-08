# RoutineReady

Visual routine display for classrooms — helping children understand their daily schedule through a clear, interactive timeline.

**Live site:** [www.routineready.co.uk](https://www.routineready.co.uk)

## Features

- Visual timeline with task cards, progress indicators, and time displays
- Three display modes: Horizontal, Multi-Row, and Auto-Pan
- 6 preset themes + custom theme editor with live preview
- Weekly schedule with day-to-template assignment
- Template system for saving and loading routines
- Support for task icons (22 school-related icons) and image uploads
- Twinkl handwriting fonts (Cursive Looped, Cursive Unlooped, Precursive)
- Mascot road transition option with custom mascot image upload
- Full backup export/import system

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4
- **Icons:** lucide-react
- **Fonts:** Twinkl handwriting font family
- **Hosting:** GitHub Pages
- **Auth & Data:** Supabase (coming soon)

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Pushes to `main` auto-deploy via GitHub Actions.

## Project Structure

```
src/
  main.jsx                    — React root
  App.jsx                     — Top-level state + view switching
  index.css                   — Tailwind + font imports
  components/                 — UI components
    SetupWizard.jsx           — First-run wizard
    DisplayView.jsx           — Fullscreen timeline display
    AdminPanel.jsx            — Admin interface
    TaskCard.jsx              — Individual task card
    ProgressLine.jsx          — Progress indicator
    MascotRoad.jsx            — Mascot transition indicator
    TimelineRow.jsx           — Row of task cards
    modals/                   — Modal dialogs
  hooks/                      — Custom React hooks
  data/                       — Static data (themes, icons, defaults)
  lib/                        — Utility functions
  styles/                     — Font declarations
public/
  fonts/                      — Twinkl .ttf font files
  CNAME                       — Custom domain config
```

## Author

TJRiley-1
