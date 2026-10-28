# Portofolio Gastin Alfiansa ⚡

Personal portfolio website of **Gastin Alfiansa** — Full-stack Developer, System Design, and AI & Automation enthusiast. Built with an **Editorial–Brutalist** aesthetic, featuring smooth scroll-driven scrollytelling, section morph transitions, and bilingual support (ID/EN).

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02.svg?logo=greensock&logoColor=white)](https://greensock.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- 🎨 **Editorial–Brutalist Aesthetic**: Warm cream paper background, bold solid color blocks (Cobalt, Lime, Lilac, Peach, Red), oversized Anton display headers paired with elegant Instrument Serif accents and technical Space Mono body text.
- 📜 **Scroll-Driven Scrollytelling**: Custom 460vh sticky hero section with reversible scroll-progress driven typography unfolding and responsive padding compensation.
- 🔄 **Section Morph Transitions**: Custom live-computed transitions (curtain slides, mask rises, and editorial unfolds) between sections powered by GSAP and native scroll math.
- 🌐 **Bilingual Support (ID / EN)**: Instant language switcher with persistence in `localStorage`, maintaining semantic accessibility and layout fidelity across both languages.
- 💼 **Interactive Showcase**:
  - **About**: Dark-mode focal contrast statement with high-res portrait and capability pills.
  - **Work**: 4 featured project showcase cards.
  - **Experience**: Editorial spread cards with zigzag chronological progress and interactive detail modal.
  - **Services**: Horizontal service capability table with custom line reveals.
  - **Contact & Footer**: Editorial letterhead fold popup modal with direct contact channels and crimson thank-you reveal.
- 🌓 **Automatic Dark Mode**: Adapts seamlessly to system preferences (`prefers-color-scheme`) with calculated contrast color adjustments.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Bundler & Dev Server**: Vite 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first token configuration in `@theme`)
- **Animation**: Native Scroll Math + GSAP 3.15 (Section Morph Transitions)
- **Typography**: Google Fonts (*Anton*, *Instrument Serif*, *Space Mono*)
- **Icons**: Lucide React / Inline SVG

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gastin11/portofolio-gastin.git
   cd portofolio-gastin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build & Deployment

To create an optimized production build:

```bash
npm run build
```

The output will be generated in the `dist/` directory, ready to be deployed to:
- **Vercel**
- **Cloudflare Pages**
- **Netlify**
- **GitHub Pages**

To preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```text
portofolio-gastin/
├── public/                 # Static assets (images, icons, resume PDF)
├── src/
│   ├── components/         # React components
│   │   ├── About.jsx       # About section with statement & photo
│   │   ├── ContactCTA.jsx  # Contact modal & CTA box
│   │   ├── Experience.jsx  # Experience timeline & editorial spread modal
│   │   ├── Footer.jsx      # Social links & copyright
│   │   ├── Hero.jsx        # Scrollytelling hero panel
│   │   ├── Navbar.jsx      # Sticky glass navigation & language switch
│   │   ├── Services.jsx    # Services table
│   │   ├── TabBar.jsx      # Mobile bottom navigation bar
│   │   ├── ThankYou.jsx    # Red curtain thank you footer
│   │   ├── Work.jsx        # Project showcase cards
│   │   └── transitions/    # Section transition overlay components
│   ├── i18n/
│   │   ├── content.js      # Bilingual dictionary (ID & EN)
│   │   └── LangContext.jsx # Language state context
│   ├── motion/             # GSAP helpers & precise nav scroll
│   ├── App.jsx             # Main layout & section composition
│   ├── index.css           # Tailwind v4 @theme, components, base styles
│   └── main.jsx            # React root entry
├── index.html              # HTML entry & Google Fonts imports
├── package.json
└── vite.config.js
```

---

## 👤 Author

**Gastin Alfiansa**
- GitHub: [@gastin11](https://github.com/gastin11)
- LinkedIn: [Gastin Alfiansa](https://linkedin.com/in/gastin-alfiansa)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
