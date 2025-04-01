import { useState, useEffect } from 'react';
import { Loader2, ImageOff, MapPin } from 'lucide-react'; // Added MapPin
import { motion, AnimatePresence } from 'framer-motion';
import { initGoogleMaps } from '@/lib/google-maps'; // Assuming this initializes the API

// Define the structure for fetched images
interface ImageInfo {
  id: string; // Use place_id or index as key
  url: string;
}

// Define props
interface LoadingStateProps {
  destination: string;
}

// Loading messages sequence
const loadingMessages = [
  "Scouting locations...",
  "Curating visuals...",
  "Mapping your journey...",
  "Finding activities...",
  "Finalizing details...",
];

const MESSAGE_INTERVAL = 2500; // ms between message changes
const MAX_IMAGES_TO_SHOW = 4;
const IMAGE_MAX_WIDTH = 300;

// --- Google Maps Interfaces (simplified) ---
/// <reference types="@types/google.maps" /> // Add reference for types
interface GooglePhoto {
  getUrl: (opts?: { maxWidth?: number; maxHeight?: number }) => string;
}
interface PlaceDetails {
  photos?: GooglePhoto[];
  place_id?: string;
}

export default function LoadingState({ destination }: LoadingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // --- Cycle through loading messages ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, MESSAGE_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // --- Initialize Google Maps API ---
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        initGoogleMaps(); // Initialize API
        const checkGoogle = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsApiReady(true);
          } else {
            setTimeout(checkGoogle, 150);
          }
        };
        checkGoogle();
      } catch (err) {
        console.error("Failed to initialize Google Maps for LoadingState:", err);
        setImageError("Map service error");
      }
    };
    if (window.google && window.google.maps && window.google.maps.places) {
        setIsApiReady(true);
    } else if (!isApiReady) {
        loadGoogleMaps();
    }
  }, [isApiReady]);

  // --- Fetch Preview Images ---
  useEffect(() => {
    if (!isApiReady || !destination || images.length > 0 || imageError) {
      return; // Only fetch once if API is ready, destination is set, and no images/errors yet
    }

    const mapDiv = document.createElement('div');
    const placesService = new window.google.maps.places.PlacesService(mapDiv);
    const request = { query: destination, fields: ['place_id'] };

    placesService.textSearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const placeId = results[0].place_id;
        if (!placeId) return;

        const detailsRequest = { placeId, fields: ['photos'] };
        placesService.getDetails(detailsRequest, (placeDetails: PlaceDetails | null, detailStatus: google.maps.places.PlacesServiceStatus) => {
          if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && placeDetails?.photos) {
            const fetchedImages = placeDetails.photos
              .slice(0, MAX_IMAGES_TO_SHOW)
              .map((photo, index) => ({
                id: `${placeId}-${index}`, // Create unique ID
                url: photo.getUrl({ maxWidth: IMAGE_MAX_WIDTH }),
              }));
            setImages(fetchedImages);
          } else {
            // console.log("No photos found for destination preview.");
            // Don't set an error, just show no images
          }
        });
      } else {
         // console.log("Place search failed for destination preview.");
         // Don't set an error
      }
    });
  }, [destination, isApiReady, images.length, imageError]); // Dependencies

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-8 space-y-6 min-h-[300px]" // Added min-height
    >
      {/* Primary Loader and Destination */}
      <div className="flex items-center text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
        <MapPin className="h-10 w-10 ml-4" />
        <span className="ml-2 text-2xl font-semibold">{destination}</span>
      </div>

      {/* Animated Text Message */}
      <div className="h-6 overflow-hidden"> {/* Container to manage text height */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentMessageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="block text-lg text-muted-foreground text-center"
          >
            {loadingMessages[currentMessageIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progressively Loaded Images */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 } }}
          className="flex flex-wrap justify-center gap-3 pt-4"
        >
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }} // Stagger animation
              className="w-24 h-24 rounded-lg overflow-hidden shadow-md bg-muted" // Added bg-muted as fallback
            >
              <img
                src={img.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails
              />
            </motion.div>
          ))}
        </motion.div>
      )}
       {/* Optional: Display API error if needed */}
       {/* {imageError && <p className="text-xs text-red-500">Could not load preview images.</p>} */}

    </motion.div>
  );
}
