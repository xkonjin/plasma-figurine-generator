import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

// Plasma brand colors
const PLASMA_GREEN = "#162F29";

// Plasma logo as base64 PNG (166x166, white spiral on dark green)
const PLASMA_LOGO_BASE64 = "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";

function buildPrompt(activity: string, customPrompt: string): string {
  const basePrompt = `Create a miniature, full-body, isometric, hyper-realistic figurine of this person.

POSE & ACTIVITY: ${activity}

STYLE REQUIREMENTS:
- Isometric view (45-degree elevated angle)
- Miniature collectible figurine aesthetic
- Hyper-realistic rendering with soft studio lighting
- Pure white background with subtle shadow underneath
- Museum-quality detail and finish

OUTFIT (subtle Plasma branding):
- A comfortable dark forest green sweater or jacket (color: ${PLASMA_GREEN})
- Well-fitted dark navy or charcoal pants
- Modern, professional-casual style

PLASMA LOGO INTEGRATION (subtle and tasteful):
- The second reference image shows the Plasma logo - a white spiral/swirl mark on dark green
- Include this exact spiral logo in ONE subtle location that feels natural to the scene:
  * Small embroidered or printed logo on the chest of the sweater/jacket (like a small brand logo)
  * OR as a tiny sticker on a laptop, phone, or notebook if present
  * OR as a subtle design element on a coffee mug or water bottle
  * OR as a small pin/badge on the clothing
- The logo should be small, elegant, and NOT overpowering - it should feel like a natural brand detail
- Use white for the spiral logo mark against the dark green clothing
- Keep it proportional and realistic - as if it's real embroidery or print

MOOD: Warm, approachable, professional yet relaxed - like a talented person who loves what they do.

QUALITY: 4K resolution, photorealistic miniature style, perfect lighting, subtle reflections.`;

  if (customPrompt) {
    return `${basePrompt}\n\nADDITIONAL DETAILS: ${customPrompt}`;
  }

  return basePrompt;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, name, activity, customPrompt } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Extract base64 data from data URL
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    const mimeType = `image/${base64Match[1]}`;
    const imageData = base64Match[2];

    const prompt = buildPrompt(
      activity || "working at a laptop",
      customPrompt || ""
    );

    // Build request with image reference and logo
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
            {
              text: `This is a photo of ${name || "the person"}. Use their likeness (face, hair, general appearance) for the figurine.`,
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: PLASMA_LOGO_BASE64,
              },
            },
            {
              text: "This is the Plasma logo - a white spiral/swirl design on dark green background. Subtly integrate this exact logo design into the figurine.",
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Generation failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract generated images
    const images: string[] = [];
    const candidates = data.candidates || [];

    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const imgMimeType = part.inlineData.mimeType || "image/png";
          images.push(`data:${imgMimeType};base64,${part.inlineData.data}`);
        }
      }
    }

    if (images.length === 0) {
      // Check for safety blocks or other issues
      if (data.promptFeedback?.blockReason) {
        return NextResponse.json(
          { error: `Content blocked: ${data.promptFeedback.blockReason}` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "No image generated. Try a different prompt or photo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
