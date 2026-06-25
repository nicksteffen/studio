"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MediaDisplayProps {
  url?: string | null;
  fileType: "photo" | "video";
}

export function MediaDisplay({ url, fileType }: MediaDisplayProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(url || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When the URL prop changes, update the local state and reset loading
    if (url) {
      setMediaUrl(url);
      setLoading(true);
      // Simulate loading time for a better user experience
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      setMediaUrl(null);
      setLoading(false);
    }
  }, [url]);

  if (loading && mediaUrl) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Loading media...</p>
      </div>
    );
  }

  if (!mediaUrl) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-center">Current Media:</p>
      <div
        className="mt-2 rounded-md overflow-hidden mx-auto"
        style={{ width: 200, height: 200 }}
      >
        {fileType === "photo" ? (
          <Image
            key={mediaUrl} // Use the url as the key to force re-render on change
            src={mediaUrl}
            alt={`Current ${fileType}`}
            width={200}
            height={200}
            className="object-cover w-full h-full"
          />
        ) : (
          <video
            key={mediaUrl} // Use the url as the key to force re-render on change
            src={mediaUrl}
            controls
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
