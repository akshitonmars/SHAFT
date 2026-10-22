# SHAFT

> **Build Beyond Ideas.**  
> Your entire project. Finally, in one place.

SHAFT is a modern project command center designed to unify AI engineering tools, repositories, backend services, and deployments into a single cohesive cockpit.

---

## Brand & Design System

- **Deep Slate**: `#101820` (Primary background)
- **Soft White**: `#F4F5F2` (High-contrast typography & foreground)
- **Cyan-Teal Accent**: `#78CFC4` (Focal highlights, active states, tags)
- **Muted Slate**: `#657580` (Secondary body & borders)
- **Display Typography**: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- **Interface Typography**: [Inter](https://fonts.google.com/specimen/Inter)

---

## Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Code Quality**: [ESLint 9](https://eslint.org/) (Flat Config)
- **Deployment**: [Vercel](https://vercel.com/) (Vite preset)

---

## Project Structure

```text
SHAFT/
├── public/
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   └── sections/
│   │       └── Hero.tsx
│   ├── pages/
│   │   └── Home.tsx
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js `20.x` or later (tested on Node `24.x`)
- npm `10.x` or later

### Installation

```bash
git clone https://github.com/akshitonmars/SHAFT.git
cd SHAFT
npm install
```

### Development Server

Start the local Vite development server:

```bash
npm run dev
```

### Production Build

Run TypeScript type-checking and bundle the application for production:

```bash
npm run build
```

Production output will be generated in `dist/`.

### Linting

Run ESLint across the codebase:

```bash
npm run lint
```

### Preview Production Build

Preview the generated `dist/` directory locally:

```bash
npm run preview
```

---

## Deployment

SHAFT is configured for automated deployments on [Vercel](https://vercel.com/):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Continuous deployment triggers automatically on every push to the `main` branch.
