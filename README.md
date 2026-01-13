# Plasma Figurine Generator

Create personalized isometric miniature figurines with Plasma branding. Upload your photo, customize the pose, and generate high-quality figurines to download and share.

![Plasma Figurine Generator](https://plasma.to/brand-assets/logo-dark.png)

## Features

- **Photo-to-Figurine**: Upload your photo and AI generates a personalized isometric figurine
- **Custom Activities**: Choose from preset activities or describe your own pose
- **Plasma Branding**: Subtle British Racing Green styling with Plasma logo elements
- **Team Gallery**: Save and browse figurines created by the team
- **High Quality**: 1024x1024 PNG images perfect for profiles and sharing

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/plasma/figurine-generator.git
cd figurine-generator
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
# Google AI Studio API Key (required)
GEMINI_API_KEY=your_api_key_here

# Vercel KV (optional - for persistent gallery)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
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
4. (Optional) Add Vercel KV for persistent gallery storage

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for Gemini 2.5 Flash Image |
| `KV_REST_API_URL` | No | Vercel KV URL (auto-set when adding KV) |
| `KV_REST_API_TOKEN` | No | Vercel KV token (auto-set when adding KV) |

## Adding Vercel KV (Optional)

For persistent gallery storage across deployments:

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **KV**
4. Follow the prompts to connect

The environment variables will be automatically added to your project.

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

**Request Body:**
```json
{
  "name": "John Doe",
  "activity": "working",
  "imageUrl": "data:image/png;base64,..."
}
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image (Nano Banana)
- **Storage**: Vercel KV (optional)
- **Deployment**: Vercel

## Brand Colors

The figurines use Plasma's brand colors:

- **British Racing Green**: #162F29 (primary)
- **Light Green**: #DCEFEA (background)
- **Accent**: #295B4F (secondary)

## License

MIT - Feel free to use and modify for your team!

---

Built by [Plasma](https://plasma.to)
