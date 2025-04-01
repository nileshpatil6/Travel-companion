import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, ImageOff } from 'lucide-react';
import { initGoogleMaps } from '@/lib/google-maps';

interface GooglePhoto {
  getUrl: (opts?: { maxWidth?: number; maxHeight?: number }) => string;
  html_attributions: string[];
}

interface PlaceDetails {
  photos?: GooglePhoto[];
  name?: string;
}

interface DisplayImageInfo {
  id: number;
  url: string | null;
  attribution: string[];
  error: boolean;
}

interface DestinationImagesProps {
  destination: string;
  apiKey: string;
  layoutStyle?: 'grid' | 'banner'; // Add layout style prop
}

const MAX_IMAGES_TO_DISPLAY = 3;
const IMAGE_MAX_WIDTH = 600;

export default function DestinationImages({ destination, apiKey, layoutStyle = 'grid' }: DestinationImagesProps) {
  const [displayedImages, setDisplayedImages] = useState<DisplayImageInfo[]>([]);
  const [allPhotos, setAllPhotos] = useState<GooglePhoto[]>([]);
  const [nextPhotoIndex, setNextPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  // --- Initialize Google Maps API ---
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        initGoogleMaps(); // Remove apiKey argument
        const checkGoogle = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsApiReady(true);
            console.log("Google Maps API is ready.");
          } else {
            setTimeout(checkGoogle, 150);
          }
        };
        checkGoogle();
      } catch (err) {
        console.error("Failed to initialize Google Maps:", err);
        setError("Could not load mapping services. Please try again later.");
        setIsLoading(false);
      }
    };
    if (!isApiReady) {
      loadGoogleMaps();
    }
  }, [apiKey, isApiReady]);

  // --- Fetch Place Details & Photos using textSearch ---
  useEffect(() => {
    if (!isApiReady || !destination || !window.google) return;

    setIsLoading(true);
    setError(null);
    setDisplayedImages([]);
    setAllPhotos([]);
    setNextPhotoIndex(0);

    // Create a dummy div for the PlacesService (hidden map)
    const mapDiv = document.createElement('div');
    const placesService = new window.google.maps.places.PlacesService(mapDiv);

    // Use textSearch as in the working reference
    const request = { query: destination, fields: ['place_id', 'name'] };
    placesService.textSearch(request, (
      results: google.maps.places.PlaceResult[] | null,
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const place = results[0];
        const placeId = place.place_id;
        const placeName = place.name;
        console.log(`Found place "${placeName}" with ID: ${placeId}`);

        // Now fetch place details to get photos
        const detailsRequest = { placeId, fields: ['photos'] };
        placesService.getDetails(detailsRequest, (
          placeDetails: PlaceDetails | null,
          detailStatus: google.maps.places.PlacesServiceStatus
        ) => {
          if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && placeDetails && placeDetails.photos && placeDetails.photos.length > 0) {
            const photos = placeDetails.photos;
            setAllPhotos(photos);
            const initialCount = Math.min(photos.length, MAX_IMAGES_TO_DISPLAY);
            const initialImages: DisplayImageInfo[] = photos.slice(0, initialCount).map((photo, index) => ({
              id: index,
              url: photo.getUrl({ maxWidth: IMAGE_MAX_WIDTH }),
              attribution: photo.html_attributions || [],
              error: false,
            }));
            setDisplayedImages(initialImages);
            setNextPhotoIndex(initialCount);
            setIsLoading(false);
          } else if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
            setError(`No photos found for "${placeName || destination}".`);
            setIsLoading(false);
          } else {
            console.error("Places details error:", detailStatus);
            setError(`Error fetching details: ${detailStatus}`);
            setIsLoading(false);
          }
        });
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setError(`No place found matching "${destination}". Try a more specific name.`);
        setIsLoading(false);
      } else {
        console.error("Text search error:", status);
        setError(`Error searching for place: ${status}`);
        setIsLoading(false);
      }
    });
  }, [destination, isApiReady]);

  // --- Handle Image Loading Errors and Replacement ---
  const handleImageError = useCallback((failedImageId: number) => {
    console.warn(`Image with ID ${failedImageId} failed to load.`);
    setDisplayedImages((currentImages) => {
      const failedIndex = currentImages.findIndex((img) => img.id === failedImageId);
      if (failedIndex === -1) return currentImages;

      // Try to replace with next available photo from allPhotos
      if (nextPhotoIndex < allPhotos.length) {
        const replacementPhoto = allPhotos[nextPhotoIndex];
        const replacement: DisplayImageInfo = {
          id: nextPhotoIndex,
          url: replacementPhoto.getUrl({ maxWidth: IMAGE_MAX_WIDTH }),
          attribution: replacementPhoto.html_attributions || [],
          error: false,
        };

        const newImages = [...currentImages];
        newImages[failedIndex] = replacement;
        setNextPhotoIndex((prev) => prev + 1);
        return newImages;
      } else {
        // No replacement available: mark as error
        const newImages = [...currentImages];
        newImages[failedIndex] = { ...newImages[failedIndex], url: null, error: true };
        return newImages;
      }
    });
  }, [allPhotos, nextPhotoIndex]);

  // --- Render ---
  if (isLoading) {
    // Adapt loading state for banner
    const loadingClasses = layoutStyle === 'banner'
      ? "absolute inset-0 flex flex-col justify-center items-center bg-gray-200"
      : "flex flex-col justify-center items-center h-64 p-4";
    return (
      <div className={loadingClasses}>
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="mt-4 text-lg text-gray-600">Loading images...</span>
      </div>
    );
  }

  if (error) {
    // Adapt error state for banner
    const errorClasses = layoutStyle === 'banner'
      ? "absolute inset-0 flex justify-center items-center text-center text-red-600 p-6 border border-red-200 bg-red-50 rounded-lg"
      : "text-center text-red-600 p-6 border border-red-200 bg-red-50 rounded-lg h-64 flex justify-center items-center";
    return (
      <div className={errorClasses}>
        <ImageOff className="h-8 w-8 mr-2" /> {error}
      </div>
    );
  }

  if (!isLoading && displayedImages.length === 0) {
    // Adapt no images state for banner
    const noImageClasses = layoutStyle === 'banner'
      ? "absolute inset-0 flex justify-center items-center text-center text-gray-600 p-6 border border-gray-200 bg-gray-50 rounded-lg"
      : "text-center text-gray-600 p-6 border border-gray-200 bg-gray-50 rounded-lg h-64 flex justify-center items-center";
    return (
      <div className={noImageClasses}>
        <ImageOff className="h-8 w-8 mr-2" /> No images could be displayed for "{destination}".
      </div>
    );
  }

  // --- Banner Layout ---
  if (layoutStyle === 'banner') {
    const firstValidImage = displayedImages.find(img => img.url && !img.error);
    return (
      <div className="absolute inset-0 w-full h-full">
        {firstValidImage ? (
          <img
            src={firstValidImage.url!}
            alt={`Photo of ${destination}`}
            className="w-full h-full object-cover" // Fill container
            onError={() => handleImageError(firstValidImage.id)}
            loading="lazy"
          />
        ) : (
          // Fallback if the first image also fails (though error state should catch this)
          <div className="absolute inset-0 flex justify-center items-center bg-gray-200 text-gray-500">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {/* Optional: Add subtle attribution for banner */}
        {firstValidImage && firstValidImage.attribution.length > 0 && (
           <div
             className="absolute bottom-1 right-1 p-1 bg-black/40 text-white text-[10px] rounded z-10"
             dangerouslySetInnerHTML={{ __html: firstValidImage.attribution[0] }}
           />
        )}
      </div>
    );
  }

  // --- Default Grid Layout ---
  return (
    <div className="w-full"> {/* Removed max-width and padding for grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Reduced gap slightly */}
        {displayedImages.map((imgInfo) => (
          <Card key={imgInfo.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <CardContent className="p-0 relative aspect-video"> {/* Use aspect ratio */}
              {imgInfo.url && !imgInfo.error ? (
                <img
                  src={imgInfo.url}
                  alt={`Photo of ${destination}`}
                  className="w-full h-full object-cover" // Fill aspect ratio box
                  onError={() => handleImageError(imgInfo.id)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex flex-col justify-center items-center text-gray-500 p-4 text-center">
                  <ImageOff className="h-10 w-10 mb-2" />
                  <span>Image unavailable</span>
                </div>
              )}
            </CardContent>
            {imgInfo.url && !imgInfo.error && imgInfo.attribution.length > 0 && (
              <CardFooter className="p-1.5 text-[10px] text-gray-500 bg-gray-50 border-t"> {/* Smaller footer */}
                <div className="truncate" dangerouslySetInnerHTML={{ __html: imgInfo.attribution.join(' | ') }} /> {/* Truncate long text */}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      {/* Footer might not be needed if used as banner */}
      {/* <footer className="mt-4 text-center text-sm text-gray-600">
        Place data and images provided by Google. See image attributions below each photo.
      </footer> */}
    </div>
  );
}
