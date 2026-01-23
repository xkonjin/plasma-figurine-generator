"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { UploadSection } from "@/components/UploadSection";
import { PromptSection } from "@/components/PromptSection";
import { GenerationPreview } from "@/components/GenerationPreview";
import { GallerySection } from "@/components/GallerySection";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [activity, setActivity] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToGallery, setSavedToGallery] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const handleImageUpload = useCallback((file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
    setSavedToGallery(false);
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError("Please upload a photo first");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setSavedToGallery(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          name: name.trim(),
          activity: activity || "working at a laptop",
          customPrompt: customPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
      } else {
        throw new Error("No images generated");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          activity,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to gallery");
      }

      setSavedToGallery(true);
      setGalleryRefreshKey(prev => prev + 1); // Trigger gallery refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <main className="min-h-screen pb-20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            <UploadSection
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              onClear={() => {
                setUploadedImage(null);
                setUploadedFile(null);
                setGeneratedImages([]);
                setSavedToGallery(false);
              }}
            />
            
            <PromptSection
              name={name}
              setName={setName}
              activity={activity}
              setActivity={setActivity}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !uploadedImage}
              className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all ${
                isGenerating || !uploadedImage
                  ? "bg-gray-400 cursor-not-allowed"
                  : "plasma-green hover:opacity-90 hover:scale-[1.02]"
              } ${isGenerating ? "generating" : ""}`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating your figurine...
                </span>
              ) : (
                "Generate Figurine"
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <GenerationPreview
            generatedImages={generatedImages}
            isGenerating={isGenerating}
            onSaveToGallery={handleSaveToGallery}
            savedToGallery={savedToGallery}
          />
        </div>

        {/* Gallery Section */}
        <GallerySection key={galleryRefreshKey} />
      </div>
    </main>
  );
}
