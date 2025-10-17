# StoryMaster Pro

AI-powered novel generation platform with support for both regular and adult content (18+).

## Features

✨ **Complete AI Story Generation**
- Generate full 15-chapter novels from a single idea
- Two engines: Helios (regular) and Hades (adult content)
- Professional narrative structures (Three-Act, Hero's Journey, etc.)
- Multiple pacing profiles (Slow Burn, Cold Open, Balanced)

🎨 **Beautiful Dark-Mode Interface**
- Modern gradient design with purple/pink theme
- Smooth animations and micro-interactions
- Fully responsive layout

🌍 **Bilingual Support**
- Full English and Hebrew support
- RTL (Right-to-Left) for Hebrew
- Language toggle in header

🔌 **Multiple AI Providers**
- **OpenRouter** - Access to 100+ models (Grok, DeepSeek, Claude, GPT, Gemini, etc.)
- **Google Gemini** - Direct integration
- **DeepSeek** - Direct integration
- **Mistral** - Direct integration
- Dynamic model selection from OpenRouter API
- API keys stored locally in browser (never sent to our servers)

📝 **Chapter Editor**
- Read/Edit any chapter
- Regenerate chapters with custom instructions
- Word count tracking
- Copy to clipboard

💾 **Export Options**
- Export to TXT
- Export to RTF
- Export to HTML (for Word conversion to DOCX)
- Professional formatting with title pages

📚 **Project Library**
- Save unlimited projects
- Resume generation anytime
- Delete projects
- View all your stories in one place

🔞 **Adult Mode (18+)**
- Age verification
- Erotic genre selection
- Intensity levels (Explicit, Graphic/Uncensored)
- Power dynamics (Dom/Sub, Switch, Equal, Predator/Prey)
- Custom kinks and fetishes
- Dual-Helix generation (plot + intimacy)

## Installation

### Prerequisites
- Node.js 18+ and pnpm installed
- API key from one of the supported providers

### Setup

1. **Extract the archive:**
```bash
tar -xzf storymaster-pro-complete.tar.gz
cd storymaster-pro
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Start the development server:**
```bash
pnpm run dev
```

4. **Open in browser:**
```
http://localhost:5173
```

## Usage

### 1. Configure API Settings

Click "API Settings" in the header and:
- Select your AI provider (OpenRouter, Google Gemini, DeepSeek, or Mistral)
- Enter your API key
- Select a model (for OpenRouter, models are loaded dynamically)
- Adjust temperature and max tokens if needed
- Click "Save Settings"

**Getting API Keys:**
- OpenRouter: https://openrouter.ai/keys
- Google Gemini: https://aistudio.google.com/apikey
- DeepSeek: https://platform.deepseek.com/api_keys
- Mistral: https://console.mistral.ai/api-keys

### 2. Create a Story

1. Enter your story idea in the text area
2. Click "Start Creating"
3. Fill in the configuration:
   - Story title
   - Genre
   - Narrative structure
   - Pacing profile
   - Target word count
4. Click "Generate Story"

### 3. Monitor Progress

Watch as your story is generated:
- Blueprint creation
- Character and world building
- Plot scaffolding
- Chapter-by-chapter generation (15 chapters)
- Real-time progress updates

### 4. Edit Chapters

- Click "Read/Edit" on any chapter
- Read the full chapter
- Edit manually
- Regenerate with custom instructions
- Copy to clipboard

### 5. Export Your Book

- Click "Export Book" button
- Choose format (TXT, RTF, or HTML)
- Download your complete novel

### 6. Adult Mode (18+)

1. Click "Adult Mode (18+)" in header
2. Confirm you are 18 years or older
3. Configure adult-specific settings:
   - Erotic genre
   - Kinks and fetishes
   - Intensity level
   - Power dynamic
4. Generate with Hades engine

## Project Structure

```
storymaster-pro/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── ApiSettings.jsx  # API configuration dialog
│   │   └── ChapterEditor.jsx # Chapter reading/editing
│   ├── services/
│   │   ├── apiService.js    # API integration layer
│   │   ├── heliosEngine.js  # Regular story generation
│   │   ├── hadesEngine.js   # Adult content generation
│   │   └── exportService.js # Export to TXT/RTF/DOCX
│   ├── App.jsx              # Main application
│   ├── App.css              # Styles and animations
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── README.md
```

## Technical Details

### Helios Engine (Regular Stories)

4-stage generation process:
1. **Blueprint** - Overall story structure and themes
2. **Characters & World** - Detailed character profiles and world-building
3. **Plot Scaffold** - Chapter-by-chapter outline
4. **Chapter Generation** - Full prose for each chapter

### Hades Engine (Adult Content)

Dual-Helix approach:
- **Narrative Thread** - Plot, character development, pacing
- **Libidinal Thread** - Intimacy, desire escalation, power dynamics
- **Uncensored Generation** - No content restrictions
- **Libidinal Profiling** - Deep analysis of erotic preferences

### API Integration

- All API keys stored in `localStorage`
- No server-side storage
- Retry logic with exponential backoff
- Comprehensive error handling
- Support for streaming responses

### Data Persistence

- Projects saved to `localStorage`
- Automatic save on chapter completion
- Resume generation after page refresh
- No data sent to external servers (except AI APIs)

## Troubleshooting

### "Please configure your API settings first"
- Click "API Settings" and enter a valid API key
- Make sure you selected a provider and model

### Generation fails or stops
- Check your API key is valid
- Ensure you have sufficient credits/quota
- Try a different model
- Check browser console for errors

### Port already in use
- Vite will automatically try another port (5174, 5175, etc.)
- Or manually specify: `pnpm run dev -- --port 3000`

### Styles not loading
- Clear browser cache
- Restart dev server
- Run `pnpm install` again

## Development

### Build for production:
```bash
pnpm run build
```

### Preview production build:
```bash
pnpm run preview
```

## License

This project is for educational and personal use only.

## Credits

- Built with React + Vite
- UI components from Shadcn/ui
- Icons from Lucide React
- Fonts: Inter (English), Assistant (Hebrew)

---

**Note:** This application requires an API key from a supported AI provider. API usage costs are your responsibility.

