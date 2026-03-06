<div align="center">

# ✦ ECHOES ✦

**Emotional Alchemy — Transform Pain into Art**

[![License](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

[Live Demo](https://echoesss.vercel.app/) • [Report Bug](https://github.com/Wydoinn/ECHOES/issues) • [Request Feature](https://github.com/Wydoinn/ECHOES/issues)

</div>

## 🌟 About

ECHOES is a premium emotional wellness experience that transforms difficult emotions into art through AI-guided reflection. It combines therapeutic journaling with creative visualization, helping users process grief, heartbreak, regret, anxiety, and more.

### ✨ Key Features

- **🎭 Multi-Modal Input** — Express yourself through text, voice recording, images, drawings, or documents
- **🤖 AI-Powered Transformation** — Google Gemini generates personalized reflections, rituals, and visual metaphors
- **🎨 Visual Alchemy** — Abstract SVG art generated from your emotional journey
- **🔮 Transformation Rituals** — Psychomagic acts to physically manifest emotional release
- **📊 Emotional Arc Visualization** — See your feelings mapped across your narrative
- **🌍 Multi-Language Support** — Available in English, Spanish, French, and German
- **♿ Accessibility First** — WCAG 2.1 compliant with reduced motion, high contrast, and screen reader support
- **🔒 Privacy-Focused** — No data stored on servers; everything processed in real-time
- **📱 PWA Ready** — Install as an app on any device


## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/app/apikey) (users provide their own key in the app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Wydoinn/ECHOES.git
   cd ECHOES
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

5. **Configure API Key** — Users add their Gemini API key in the app settings (gear icon → API Key)


## 🔑 API Key Setup

ECHOES uses a **BYOK (Bring Your Own Key)** model for the Gemini API:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open ECHOES and click the **Settings** gear icon
3. Click **API Key** and paste your key
4. The key is validated and stored locally in your browser
5. Your key is **never sent to our servers** — all AI calls go directly to Google

**Tier Detection:**
- 🟡 **Free Tier** — 15 requests/minute, 1,500 requests/day
- 🟢 **Paid Tier** — Higher limits, priority access


## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy! (No server-side API key needed — users provide their own)

The included `vercel.json` handles all configuration automatically.


## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **AI** | Google Gemini API |
| **i18n** | i18next |
| **PDF Export** | jsPDF |
| **Deployment** | Vercel |


## 📁 Project Structure

```
ECHOES/
├── api/                    # Vercel serverless functions
│   └── gemini.ts          # API proxy for Gemini
├── components/            # React components
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── GuidedJournaling.tsx # Step-by-step prompts
│   └── ...
├── i18n/                  # Internationalization
│   ├── index.ts
│   └── locales/           # EN, ES, FR, DE translations
├── screens/               # Page components
│   ├── Landing.tsx
│   ├── EmotionalCanvas.tsx
│   ├── ProcessingScreen.tsx
│   ├── RevelationScreen.tsx
│   └── LegalPages.tsx
├── services/              # API services
│   └── geminiService.ts
├── utils/                 # Utility functions
├── public/                # Static assets
└── index.css              # Global styles
```


## 🎨 Features Deep Dive

### Emotional Categories
- 💔 **Unsent Message** — Words you never got to say
- 🕊️ **Grief & Loss** — Processing absence
- 🔗 **Broken Bonds** — Fractured relationships
- ⚡ **Regret & Guilt** — Making peace with the past
- 🌱 **Self-Forgiveness** — Learning to be kind to yourself
- 🎭 **Identity & Confusion** — Finding yourself

### AI Response Styles
Choose how ECHOES speaks to you:
- **Poetic** — Metaphorical, lyrical, deeply symbolic
- **Direct** — Clear, actionable, straightforward
- **Therapeutic** — Warm, validating, clinically-informed
- **Spiritual** — Transcendent, mindful, connected

### Accessibility Features
- Skip-to-content navigation
- Reduced motion support
- High contrast mode
- Screen reader announcements (aria-live)
- Keyboard navigation
- Focus indicators


## 🔒 Privacy & Security

ECHOES takes your emotional privacy seriously:

- ✅ **No server storage** — Your content is never saved
- ✅ **Real-time processing** — Data discarded immediately after use
- ✅ **Local-only history** — Session data stays in your browser
- ✅ **Secure API proxy** — API keys never exposed to client
- ✅ **No tracking** — Zero analytics on emotional content


## 🛡️ Crisis Support

ECHOES is **not a substitute for professional mental health care**. If you're in crisis:

- **National Suicide Prevention Lifeline:** 988
- **Crisis Text Line:** Text HOME to 741741
- **International:** [Find a crisis center](https://www.iasp.info/resources/Crisis_Centres/)


## 📄 License

MIT License — see [LICENSE](LICENSE) for details.


<div align="center">

**Made with 💜 for emotional healing**

*Transform your pain. Release your echoes.*

</div>
