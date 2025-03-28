import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Make sure this path is correct

interface Suggestion {
  display_name: string;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

export default function LocationInput({ value, onChange, label, placeholder }: LocationInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [userCountryCode, setUserCountryCode] = useState<string>("");
  const { toast } = useToast();
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Fetch the user's country code based on their IP on mount
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error(`IP API failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data && data.country) {
          setUserCountryCode(data.country.toLowerCase());
        }
      } catch (error) {
        console.error("Error fetching user country:", error);
        // Optionally handle error or notify user
      }
    })();
  }, []);

  // Auto suggest: fetch suggestions when user types
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      (async () => {
        try {
          const countryParam = userCountryCode ? `&countrycodes=${userCountryCode}` : "";
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
              value
            )}${countryParam}`
          );

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setSuggestions(data);
          setIsSuggestionsVisible(true);
        } catch (error: any) {
          console.error("Error fetching suggestions:", error);
        }
      })();
    }, 300);
  }, [value, userCountryCode]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setIsSuggestionsVisible(false);
  };

  const handleAutoLocate = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      }).catch(async (error) => {
        if (error instanceof GeolocationPositionError && error.code === error.TIMEOUT) {
          return new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000,
            });
          });
        }
        throw error;
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Nominatim API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Nominatim error: ${data.error}`);
      }

      if (data.address) {
        const locationName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.suburb ||
          data.address.county ||
          data.address.state_district ||
          data.address.state ||
          data.display_name;

        if (locationName) {
          onChange(locationName);
          toast({
            title: "Location Found",
            description: `Your location has been set to ${locationName}`,
          });
        } else {
          throw new Error("Could not determine location name from coordinates.");
        }
      } else {
        throw new Error("Could not get location details from Nominatim.");
      }
    } catch (error: any) {
      console.error("Error getting location:", error);

      let description = "Could not determine your location. Please try again or enter manually.";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            description = "Location permission denied. Please enable location services or enter manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            description = "Location information is unavailable. Please try again or enter manually.";
            break;
          case error.TIMEOUT:
            description = "Could not get your location in time. Please try again or enter manually.";
            break;
        }
      } else if (error.message) {
        description = `Error: ${error.message}. Please try again or enter manually.`;
      }

      toast({
        title: "Auto-Locate Error",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hide suggestions when clicking outside the component
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-3 relative" ref={wrapperRef}>
      <Label
        htmlFor={label.replace(/\s+/g, "-").toLowerCase()}
        className="text-lg flex items-center gap-2"
      >
        <MapPin className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={label.replace(/\s+/g, "-").toLowerCase()}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsSuggestionsVisible(true);
          }}
          className="h-12 flex-1 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-md focus:border-blue-500 transition-colors"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAutoLocate}
          disabled={isLoading}
          className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="Auto-detect location"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </Button>
      </div>
      {/* Suggestion dropdown */}
      {isSuggestionsVisible && suggestions.length > 0 && (
        <ul className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg z-10">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer p-2 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-0"
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
