# BCI Journey: The Neuro-Link

A gamified 3D educational platform that teaches neuroscience and Brain-Computer Interfaces to students aged 10-18 through immersive visualization, AI-powered dialogue, and interactive quizzes.

Built with React, Three.js, and Google Gemini.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r182-black?logo=threedotjs)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)

---

## Quick Start

```bash
git clone <repo-url>
cd BCI-Journey
npm install
cp .env.example .env   # then add your Gemini API key
npm run dev             # opens at http://localhost:3000
```

**Prerequisite:** A [Google Gemini API key](https://aistudio.google.com/apikey) is required for AI features (dialogue generation, text-to-speech, image generation, quizzes). The app will fall back to limited functionality without one.

---

## What It Does

Users explore 10 interconnected brain regions ("Worlds") rendered as a 3D particle-cloud brain. Each World contains up to 100 questions arranged in a neural network structure. Two AI characters guide the learning:

- **Synapse** — the biological expert, explains neuroscience concepts
- **Spark** — the technological expert, covers BCI engineering and applications

### Learning Flow

1. **Landing Page** (`/`) — introduces the platform and onboards the user
2. **Journey Map** (`/journey`) — a rotatable 3D brain with 10 selectable World nodes
3. **Neural Navigator** (`/journey/:worldName`) — zooms into a World, showing a 3D grid of question nodes that unlock progressively
4. **Simulation Mode** — activates when a node is selected; four learning modes per question:
   - **Listen** — watch a scripted dialogue between Synapse and Spark with AI-generated images and voice
   - **Talk** — real-time voice conversation with the AI characters via Gemini Live Audio
   - **Summary** — AI-generated key takeaways for the topic
   - **Quiz** — 5-question quiz that earns "Somas" (in-app currency) and marks the node as completed

### BCI Lab

A separate section (`/bcilab`) hosts an experiment library with interactive BCI paradigm demos: P300 Speller, SSVEP Frequency Detector, Motor Imagery Classifier, Neurofeedback Relaxation Trainer, and more.

---

## The 10 Worlds

| # | World | Region | Focus |
|---|-------|--------|-------|
| 1 | Brain Anatomy — The Control Center | Cerebral Atlas | Lobes, brainstem, brain structure |
| 2 | Brain Cells & Electricity | Synaptic Web | Neurons, synapses, electrical signals |
| 3 | BCI Basics (The Bridge) | Digital Bridge | Brain-computer communication fundamentals |
| 4 | Hardware & Electricity (The Tools) | Hardware Lab | Electrodes, sensors, recording equipment |
| 5 | Brainwave Patterns (The Language) | Signal Spectrum | Alpha, Beta, Gamma frequency bands |
| 6 | Senses & Messages | Sensory Hub | Visual, auditory, and tactile processing |
| 7 | Helping People | Medical Nexus | Rehabilitation and medical BCI applications |
| 8 | Gaming, Robots & Fun | Cyber Arena | Entertainment and robotics with bio-signals |
| 9 | Computer Magic (Math & Data) | Data Core | AI, machine learning, neural data science |
| 10 | Future & Ethics | Future Horizon | Privacy, identity, neuroethics |

---

## Gamification

- **Node Unlocking** — nodes unlock column-by-column as prerequisite nodes are completed
- **Activity Rings** — visual indicators on each node show Listen/Talk/Summary/Quiz completion
- **Somas** — currency earned from quizzes (up to 17M per correct answer), displayed in the HUD
- **Progress Persistence** — all progress is stored in `localStorage` per World

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| 3D Rendering | Three.js via React Three Fiber + Drei helpers |
| Post-Processing | @react-three/postprocessing (Bloom, Vignette) |
| AI Services | Google Gemini (`@google/genai`) |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS (CDN) |
| Icons | Lucide React |
| Fonts | Orbitron (headers), Rajdhani (body) |

### Gemini Models Used

| Purpose | Model |
|---------|-------|
| Text generation (scripts, summaries, quizzes) | `gemini-2.5-flash-preview-04-17` |
| Image generation | `gemini-2.0-flash-exp` |
| Text-to-speech | `gemini-2.5-flash-preview-tts` |
| Live voice sessions | `gemini-2.0-flash-live-001` |

---

## Project Structure

```
BCI-Journey/
├── assets/questions/          # 10 JSON files, one per World (100 questions each)
├── components/
│   ├── landing/               # Landing page sections (Navbar, Hero, Features, FAQ, CTA)
│   ├── BCIJourney.tsx         # 3D brain map — Canvas, lights, camera, post-processing
│   ├── NeuralNavigator.tsx    # Per-World neural network grid with node interaction
│   ├── SimulationMode.tsx     # AI dialogue playback (Listen mode)
│   ├── LiveSession.tsx        # Real-time voice chat (Talk mode)
│   ├── LessonSummary.tsx      # AI-generated summary overlay
│   ├── NeuronActivationQuiz.tsx # 5-question quiz with scoring
│   ├── WorldNode.tsx          # 3D sphere for each brain region
│   ├── NeuralNode.tsx         # 3D node for each question (locked/active/completed states)
│   ├── NeuralNetworkGrid.tsx  # Arranges nodes in a 10-column diamond layout
│   ├── BrainParticles.tsx     # Background particle system
│   ├── NeuralPathways.tsx     # Connection lines between World nodes
│   ├── SynapseConnections.tsx # Connection lines between Neural nodes
│   ├── UIOverlay.tsx          # HUD panel for world info and entry button
│   └── LoadingTeaser.tsx      # Cinematic loading screen
├── pages/
│   ├── LandingPage.tsx        # Landing page layout
│   ├── NeuralNavigatorPage.tsx # Route wrapper — extracts worldName param
│   ├── BCILabPage.tsx         # Experiment library browser
│   ├── ExperimentSetupPage.tsx # Configure an experiment before running
│   ├── ExperimentStartPage.tsx # Run an experiment
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   └── geminiService.ts       # All Gemini API calls (text, images, speech, quizzes)
├── utils/
│   ├── progressManager.ts     # localStorage read/write for user progress
│   ├── questionLoader.ts      # Maps question JSON into NeuralNode grid structure
│   ├── audioUtils.ts          # PCM audio buffer decoding and playback
│   ├── audioStreamer.ts       # Live audio streaming via Web Audio API
│   └── stringUtils.ts         # Slug/string helpers
├── data/
│   └── experiments.ts         # BCI experiment definitions for the Lab
├── constants.ts               # World definitions, AI system prompt
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # Router configuration
├── index.tsx                  # React entry point
├── index.html                 # HTML shell (loads Tailwind CDN, custom fonts)
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key ([get one here](https://aistudio.google.com/apikey)) |

Copy `.env.example` to `.env` and fill in your key.

---

## Available Scripts

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview the production build locally
```

---

## Design System

The app uses a **"Cyber-Organic"** aesthetic — dark backgrounds with neon accents and glowing particle effects.

| Token | Value | Usage |
|-------|-------|-------|
| Cyber Black | `#0a0a0f` | Backgrounds |
| Neon Blue | `#00f3ff` | Primary accent, World 1 |
| Neon Pink | `#ff00ff` | Secondary accent, World 3 |
| Electric Gold | `#ffd700` | Highlights, World 2 |
| Matrix Green | `#00ff41` | World 5 |
| Orbitron | — | Headings and futuristic UI labels |
| Rajdhani | — | Body text and technical readouts |

Visual effects include **Bloom** post-processing on the 3D scene and **Vignette** for atmospheric framing.

---

## Browser Requirements

- Modern browser with **WebGL 2** support (Chrome, Edge, Firefox, Safari 15+)
- **Web Audio API** support (required for voice features)
- **Microphone access** (required for Talk mode)

---

## License

This project is private and not currently published under an open-source license.
