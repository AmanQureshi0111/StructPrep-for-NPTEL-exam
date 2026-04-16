# Structural Biology Practice Quiz

A responsive quiz web app for **NPTEL Structural Biology exam preparation** built with **React, JavaScript, HTML, and CSS**.

## Features

- Weekly practice mode (dynamic week list from question data)
- All-questions practice mode
- Random question order toggle
- Auto-next on answer selection
- Back navigation and live progress indicator
- Result summary: total, correct, wrong, score percentage
- Wrong-answer review with correct answers
- Performance-based result message
- Home page motivational message
- Sound effects toggle
- Quiz timer
- Local storage progress resume
- Runtime cleanup of citation markers in question text
- Runtime normalization to strict 4-option, single-correct-answer MCQs

## Tech Stack

- React
- React Router
- Vite
- Plain CSS (mobile-first responsive styling)

## Project Structure

```text
src/
  components/
    QuizProgress.jsx
  data/
    questions.json
  pages/
    HomePage.jsx
    WeekSelectPage.jsx
    QuizPage.jsx
    ResultPage.jsx
  utils/
    questionUtils.js
  App.jsx
  main.jsx
  styles.css
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Question Data Format

Questions are stored in `src/data/questions.json` with this shape:

```json
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "week": 1
}
```

> The app also handles older/mixed entries and normalizes them at runtime.

## Deployment

Deploy easily on **Vercel** or **Netlify**:

1. Push this project to GitHub
2. Import repo in Vercel/Netlify
3. Use:
   - Build command: `npm run build`
   - Output directory: `dist`

## Notes

- Run commands from the project root: `C:\ProgramCodes\StructPrep`
- If dependency issues appear, remove `node_modules` and run `npm install` again.
