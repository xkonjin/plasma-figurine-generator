"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  name: string;
  activity: string;
  imageUrl: string;
  createdAt: string;
}

export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, name: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `plasma-figurine-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-medium plasma-green-text mb-6">Team Gallery</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#162F29] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium plasma-green-text">Team Gallery</h2>
          <span className="text-sm text-[#569F8C]">{items.length} figurines</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-[#569F8C]">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">No figurines yet</p>
            <p className="text-sm">Be the first to create and save your figurine!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#DCEFEA]/30 hover:ring-2 hover:ring-[#162F29] transition-all"
              >
                <Image
                  src={item.imageUrl}
                  alt={`${item.name}'s figurine`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-white/70 text-xs truncate">{item.activity}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square">
              <Image
                src={selectedItem.imageUrl}
                alt={`${selectedItem.name}'s figurine`}
                fill
                className="object-contain bg-[#DCEFEA]/30"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium plasma-green-text">{selectedItem.name}</h3>
              <p className="text-[#569F8C] mb-4">{selectedItem.activity}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedItem.imageUrl, selectedItem.name)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium plasma-green text-white hover:opacity-90 transition-all"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="py-3 px-6 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
