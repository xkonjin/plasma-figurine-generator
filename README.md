# Plasma Figurine Generator

Create personalized isometric miniature figurines with Plasma branding. Upload your photo, customize the pose, and generate high-quality figurines to download and share.

**Live Demo:** https://plasma-figurine-generator.vercel.app

## Features

- **Photo-to-Figurine**: Upload your photo and AI generates a personalized isometric figurine
- **Custom Activities**: Choose from 16 preset activities or describe your own pose
- **Plasma Branding**: Subtle British Racing Green styling with Plasma logo elements
- **Team Gallery**: Save and browse figurines created by the team
- **High Quality**: 1024x1024 PNG images perfect for profiles and sharing
- **Magic Link Auth**: Only @plasma.to team members can access (via email magic link)

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
# Required
GEMINI_API_KEY=your_gemini_api_key
AUTH_SECRET=your_auth_secret_32_chars
AUTH_RESEND_KEY=your_resend_api_key

# Optional (for persistent gallery)
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
# OR
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Production Setup (Complete)

### Step 1: Deploy to Vercel

```bash
npx vercel --prod
```

### Step 2: Add Required Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

| Variable | Required | How to Get |
|----------|----------|------------|
| `GEMINI_API_KEY` | Yes | [Google AI Studio](https://aistudio.google.com/apikey) |
| `AUTH_SECRET` | Yes | Run: `openssl rand -base64 32` |
| `AUTH_RESEND_KEY` | Yes | [Resend Dashboard](https://resend.com/api-keys) |

### Step 3: Set Up Resend (Magic Link Emails)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (plasma.to)
3. Create API key → Copy to `AUTH_RESEND_KEY`

**Domain Setup:**
- Go to Domains → Add Domain → plasma.to
- Add the DNS records shown in Resend to your domain
- Wait for verification (usually minutes)

### Step 4: Add Persistent Gallery Storage

**Option A: Vercel Blob (Recommended)**
```bash
# In project directory
npx vercel blob store add figurines-gallery
# Link to project when prompted
# BLOB_READ_WRITE_TOKEN is auto-added
```

**Option B: Upstash Redis**
1. Go to [console.upstash.com](https://console.upstash.com)
2. Create Redis database
3. Copy REST URL and Token to Vercel env vars:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Step 5: Redeploy

```bash
npx vercel --prod
```

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `AUTH_SECRET` | Yes | NextAuth secret (32+ chars) |
| `AUTH_RESEND_KEY` | Yes | Resend API key for magic links |
| `KV_REST_API_URL` | No* | Upstash Redis URL |
| `KV_REST_API_TOKEN` | No* | Upstash Redis token |
| `BLOB_READ_WRITE_TOKEN` | No* | Vercel Blob token |

*At least one storage option recommended for persistent gallery

## Authentication

The app uses magic link authentication restricted to @plasma.to emails:

1. User enters their @plasma.to email
2. Magic link sent via Resend
3. Click link to sign in
4. Session maintained via cookies

Non-plasma.to emails are rejected at sign-in.

## API Endpoints

### POST /api/generate
Generate a figurine from a photo.

### GET /api/gallery
Fetch all saved figurines.

### POST /api/gallery
Save a figurine to the gallery.

### GET/POST /api/auth/*
NextAuth authentication endpoints.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: NextAuth.js v5 with Resend magic links
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image
- **Storage**: Upstash Redis or Vercel Blob
- **Deployment**: Vercel

## Brand Colors

From [plasma.to/brand](https://plasma.to/brand):

- **British Racing Green**: #162F29 (primary)
- **Light Green**: #DCEFEA (background)
- **Accent**: #295B4F (secondary)

## Troubleshooting

### "Only @plasma.to emails can access"
- This is intentional - only team members can use the app

### Magic link not received
- Check spam folder
- Verify Resend domain is set up correctly
- Check `AUTH_RESEND_KEY` is valid

### Gallery not persisting
- Add Upstash Redis or Vercel Blob storage
- Check environment variables are set

### "No image generated"
- Verify `GEMINI_API_KEY` is valid
- Try a different photo/activity
- Check Vercel function logs for errors

---

Built by [Plasma](https://plasma.to)
