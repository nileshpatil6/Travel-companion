import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DestinationImagesProps {
  destination: string;
}

export default function DestinationImages({ destination }: DestinationImagesProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Using Unsplash API to fetch images
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=6&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        const imageUrls = data.results.map((result: any) => result.urls.regular);
        setImages(imageUrls);
      } catch (err) {
        setError('Failed to load destination images');
        console.error('Error fetching images:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (destination) {
      fetchImages();
    }
  }, [destination]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Destination Images</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((imageUrl, index) => (
          <Card key={index} className="overflow-hidden">
            <img
              src={imageUrl}
              alt={`${destination} - Image ${index + 1}`}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
          </Card>
        ))}
      </div>
    </div>
  );
} 