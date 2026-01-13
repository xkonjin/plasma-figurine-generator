import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

// Plasma brand colors
const PLASMA_GREEN = "#162F29";

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

SUBTLE BRANDING (very minimal):
- A tiny "P" logo or Plasma symbol visible somewhere natural (laptop sticker, coffee mug, small pin)
- The green color should feel natural, not corporate

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

    // Build request with image reference
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
