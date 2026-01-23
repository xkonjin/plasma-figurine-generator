"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { UploadSection } from "@/components/UploadSection";
import { PromptSection } from "@/components/PromptSection";
import { GenerationPreview } from "@/components/GenerationPreview";
import { GallerySection } from "@/components/GallerySection";
import PaymentModal from "@/components/PaymentModal";

export default function Home() {
  const { data: session } = useSession();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [activity, setActivity] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToGallery, setSavedToGallery] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState<any | null>(null);

  const isPlasmaUser = session?.user?.email?.endsWith("@plasma.to");

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

  const handleBrandLogoUpload = useCallback((file: File) => {
    setBrandLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setBrandLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
          brandLogo: brandLogo,
          usePlasmabranding: isPlasmaUser,
        }),
      });

      const data = await response.json();

      // Handle 402 Payment Required
      if (response.status === 402) {
        setPaymentRequired(data);
        setShowPaymentModal(true);
        setIsGenerating(false);
        return;
      }

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

  const handlePaymentComplete = async () => {
    setShowPaymentModal(false);
    // Retry generation after payment
    await handleGenerate();
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
      setGalleryRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <main className="min-h-screen pb-20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Show info banner for non-plasma users */}
        {!isPlasmaUser && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl">
            <p className="text-sm">
              <strong>Note:</strong> Figurine generation costs {process.env.NEXT_PUBLIC_FIGURINE_PRICE || "0.10"} USDT0. 
              Pay with any token via cross-chain swap.
            </p>
          </div>
        )}

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

            {/* Brand Logo Upload - Only for non-Plasma users */}
            {!isPlasmaUser && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">Brand Logo (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your brand logo to include it in the figurine. If not provided, a generic design will be used.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBrandLogoUpload(file);
                    }}
                    className="hidden"
                    id="brand-logo-upload"
                  />
                  <label htmlFor="brand-logo-upload" className="cursor-pointer">
                    {brandLogo ? (
                      <div className="space-y-2">
                        <img src={brandLogo} alt="Brand logo" className="w-24 h-24 object-contain mx-auto" />
                        <p className="text-sm text-gray-600">Click to change logo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">🏢</div>
                        <p className="text-gray-600">Click to upload your brand logo</p>
                        <p className="text-xs text-gray-500">PNG, JPG, or SVG (recommended: square, transparent background)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

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
                  : isPlasmaUser 
                    ? "plasma-green hover:opacity-90 hover:scale-[1.02]"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 hover:scale-[1.02]"
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

        {/* Gallery Section - Only for logged-in users */}
        {session && <GallerySection key={galleryRefreshKey} />}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentRequired={paymentRequired}
        onPaymentComplete={(invoiceId, txHash) => {
          setShowPaymentModal(false);
          handleGenerate();
        }}
      />
    </main>
  );
}
