"use client";

import { useState } from "react";
import Image from "next/image";

interface GenerationPreviewProps {
  generatedImages: string[];
  isGenerating: boolean;
  onSaveToGallery: (imageUrl: string) => void;
  savedToGallery: boolean;
}

export function GenerationPreview({
  generatedImages,
  isGenerating,
  onSaveToGallery,
  savedToGallery,
}: GenerationPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleDownload = async (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `plasma-figurine-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-medium plasma-green-text mb-4">
        3. Your Figurine
      </h2>

      <div className="relative aspect-square bg-[#DCEFEA]/30 rounded-xl overflow-hidden mb-4">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-4 plasma-green rounded-2xl flex items-center justify-center generating">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-[#295B4F] font-medium">Creating your figurine...</p>
            <p className="text-sm text-[#569F8C]">This may take 10-30 seconds</p>
          </div>
        ) : generatedImages.length > 0 ? (
          <Image
            src={generatedImages[selectedIndex]}
            alt="Generated figurine"
            fill
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#569F8C]">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="font-medium">Your figurine will appear here</p>
            <p className="text-sm">Upload a photo and click Generate</p>
          </div>
        )}
      </div>

      {/* Thumbnails if multiple images */}
      {generatedImages.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto py-2">
          {generatedImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                selectedIndex === idx ? "border-[#162F29]" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`Variation ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {generatedImages.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload(generatedImages[selectedIndex])}
            className="flex-1 py-3 px-4 rounded-xl font-medium plasma-green text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button
            onClick={() => onSaveToGallery(generatedImages[selectedIndex])}
            disabled={savedToGallery}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              savedToGallery
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-[#DCEFEA] text-[#295B4F] hover:bg-[#569F8C]/20"
            }`}
          >
            {savedToGallery ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save to Gallery
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
