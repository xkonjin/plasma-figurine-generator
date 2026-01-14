# Plasma Figurine Generator

Create personalized isometric miniature figurines with Plasma branding. Upload your photo, customize the pose, and generate high-quality figurines to download and share.

**Live Demo:** https://plasma-figurine-generator.vercel.app

## Features

- **Photo-to-Figurine**: Upload your photo and AI generates a personalized isometric figurine
- **Custom Activities**: Choose from 16 preset activities or describe your own pose
- **Plasma Branding**: Subtle British Racing Green styling with Plasma logo elements
- **Team Gallery**: Save and browse figurines created by the team
- **High Quality**: 1024x1024 PNG images perfect for profiles and sharing

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd plasma-figurine-generator
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
# Google AI Studio API Key (required)
GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key at: https://aistudio.google.com/apikey

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/plasma/figurine-generator&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20key%20for%20image%20generation&envLink=https://aistudio.google.com/apikey)

### Manual Deploy

1. Push to GitHub
2. Import to Vercel: https://vercel.com/new
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy!

## Adding Persistent Gallery Storage (Optional)

The gallery works in-memory by default. For persistent storage across deployments, add Upstash Redis:

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Browse Marketplace** → Search "Upstash"
4. Select **Upstash for Redis** → **Add Integration**
5. Follow prompts to create a free database
6. Environment variables are automatically added

### Option 2: Via Upstash Console

1. Sign up at https://console.upstash.com
2. Create a new Redis database (free tier available)
3. Copy the REST URL and Token
4. Add to Vercel environment variables:
   - `KV_REST_API_URL` = Your Upstash REST URL
   - `KV_REST_API_TOKEN` = Your Upstash REST Token

### Option 3: Via CLI

```bash
# Install Upstash CLI
npm install -g @upstash/cli

# Login
upstash auth login --email your@email.com

# Create database
upstash redis create figurines-gallery --region us-east-1

# Copy the credentials and add to Vercel
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for Gemini 2.5 Flash Image |
| `KV_REST_API_URL` | No | Upstash Redis REST URL (for persistent gallery) |
| `KV_REST_API_TOKEN` | No | Upstash Redis REST token (for persistent gallery) |

## API Endpoints

### POST /api/generate

Generate a figurine from a photo.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "name": "John Doe",
  "activity": "working at a laptop",
  "customPrompt": "wearing glasses"
}
```

**Response:**
```json
{
  "images": ["data:image/png;base64,..."]
}
```

### GET /api/gallery

Fetch all saved figurines.

### POST /api/gallery

Save a figurine to the gallery.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image (Nano Banana)
- **Storage**: Upstash Redis (optional)
- **Deployment**: Vercel

## Brand Colors

The figurines use Plasma's brand colors from [plasma.to/brand](https://plasma.to/brand):

- **British Racing Green**: #162F29 (primary)
- **Light Green**: #DCEFEA (background)
- **Accent**: #295B4F (secondary)

## Customization

### Adding More Activities

Edit `src/components/PromptSection.tsx` and add to the `PRESET_ACTIVITIES` array:

```typescript
const PRESET_ACTIVITIES = [
  { value: "your custom activity", label: "Label", emoji: "🎯" },
  // ...
];
```

### Modifying the Prompt

Edit `src/app/api/generate/route.ts` to customize the generation prompt, outfit descriptions, or branding elements.

## Troubleshooting

### "No image generated"
- Check your Gemini API key is valid
- Try a different photo or activity
- Some content may be blocked by safety filters

### Gallery not persisting
- Add Upstash Redis for persistent storage
- Without Redis, gallery resets on each deployment

### Generation taking too long
- Gemini image generation typically takes 10-30 seconds
- Function timeout is set to 60 seconds

## License

MIT - Feel free to use and modify for your team!

---

Built by [Plasma](https://plasma.to)
