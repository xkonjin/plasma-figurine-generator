import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getStorage } from "@/lib/storage";

interface GalleryItem {
  id: string;
  name: string;
  activity: string;
  imageUrl: string;
  createdAt: string;
}

const GALLERY_KEY = "plasma-figurines:gallery";
const MAX_GALLERY_ITEMS = 100;

export async function GET() {
  try {
    const storage = await getStorage();
    const items = await storage.get<GalleryItem[]>(GALLERY_KEY) || [];
    
    // Sort by newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, activity, imageUrl } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: "Name and image are required" },
        { status: 400 }
      );
    }

    const newItem: GalleryItem = {
      id: uuidv4(),
      name: name.trim(),
      activity: activity || "figurine",
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const storage = await getStorage();
    let items = await storage.get<GalleryItem[]>(GALLERY_KEY) || [];
    
    items.unshift(newItem);

    // Keep only the most recent items
    if (items.length > MAX_GALLERY_ITEMS) {
      items = items.slice(0, MAX_GALLERY_ITEMS);
    }

    await storage.set(GALLERY_KEY, items);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Gallery save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save" },
      { status: 500 }
    );
  }
}
