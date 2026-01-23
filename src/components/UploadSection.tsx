"use client";

import { useCallback } from "react";
import Image from "next/image";

interface UploadSectionProps {
  uploadedImage: string | null;
  onImageUpload: (file: File) => void;
  onClear: () => void;
}

export function UploadSection({ uploadedImage, onImageUpload, onClear }: UploadSectionProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-medium text-gray-800 mb-4">
        1. Upload Your Photo
      </h2>
      
      {!uploadedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-1">
              Drop your photo here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              For best results, use a clear face photo
            </p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-xl overflow-hidden">
            <Image
              src={uploadedImage}
              alt="Uploaded photo"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">
            Photo uploaded! Customize your figurine below.
          </p>
        </div>
      )}
    </div>
  );
}
