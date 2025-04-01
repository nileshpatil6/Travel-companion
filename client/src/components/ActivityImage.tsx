/// <reference types="@types/google.maps" />
import { useState, useEffect } from 'react';
import { initGoogleMaps } from '@/lib/google-maps'; // Assuming this initializes the API
import { ImageOff, Loader2 } from 'lucide-react';

interface GooglePhoto {
  getUrl: (opts?: { maxWidth?: number; maxHeight?: number }) => string;
}

interface PlaceDetails {
  photos?: GooglePhoto[];
}

interface ActivityImageProps {
  locationQuery: string;
  // No API Key needed here if initGoogleMaps handles it globally
}

const IMAGE_MAX_WIDTH = 200; // Smaller max width for activity images

export default function ActivityImage({ locationQuery }: ActivityImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  // --- Initialize Google Maps API ---
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        initGoogleMaps(); // Initialize API (no key needed here if handled globally)
        const checkGoogle = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsApiReady(true);
            // console.log("Google Maps API is ready for ActivityImage.");
          } else {
            setTimeout(checkGoogle, 150);
          }
        };
        checkGoogle();
      } catch (err) {
        console.error("Failed to initialize Google Maps for ActivityImage:", err);
        setError("Map service error"); // Keep error brief
        setIsLoading(false);
      }
    };
    // Check if already initialized by another component
    if (window.google && window.google.maps && window.google.maps.places) {
        setIsApiReady(true);
    } else if (!isApiReady) {
        loadGoogleMaps();
    }
  }, [isApiReady]);

  // --- Fetch Place Photo ---
  useEffect(() => {
    if (!isApiReady || !locationQuery || !window.google) {
        // If API not ready or no query, stop loading but don't show error unless API failed init
        if (!error) setIsLoading(false); 
        return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    const mapDiv = document.createElement('div'); // Dummy div
    const placesService = new window.google.maps.places.PlacesService(mapDiv);

    // Use textSearch to find the place based on the location query
    const request = { query: locationQuery, fields: ['place_id'] };
    placesService.textSearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const placeId = results[0].place_id;
        if (!placeId) {
            // console.log(`No place_id found for "${locationQuery}".`);
            setIsLoading(false);
            return; // No image possible
        }

        // Fetch details to get photos
        const detailsRequest = { placeId, fields: ['photos'] };
        placesService.getDetails(detailsRequest, (placeDetails: PlaceDetails | null, detailStatus: google.maps.places.PlacesServiceStatus) => {
          if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && placeDetails?.photos?.[0]) {
            const photo = placeDetails.photos[0];
            setImageUrl(photo.getUrl({ maxWidth: IMAGE_MAX_WIDTH }));
            setIsLoading(false);
          } else {
            // console.log(`No photos found or details error for placeId ${placeId}: ${detailStatus}`);
            setIsLoading(false); // No image found or error, don't show placeholder
          }
        });
      } else {
        // console.log(`Text search failed for "${locationQuery}": ${status}`);
        setIsLoading(false); // Place not found, don't show placeholder
      }
    });
  }, [locationQuery, isApiReady, error]); // Re-run if query or API readiness changes, or if initial API load errored

  // --- Render ---
  if (isLoading) {
    // Optional: subtle loading state, could be removed for cleaner look
    // return <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></div>;
    return null; // Or return null to show nothing while loading
  }

  if (error || !imageUrl) {
    // Don't render anything if there's an error or no image URL
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-md"> {/* REMOVED aspect-video */}
      <img
        src={imageUrl}
        alt={`Image of ${locationQuery}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImageUrl(null)} // If image fails to load, hide it
      />
    </div>
  );
}