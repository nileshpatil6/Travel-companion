import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, MapPin, Navigation } from "lucide-react";
import { format } from "date-fns";
import { type SearchParams } from "@shared/schema";
import TripDuration from "./trip-duration";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import AuthDialog from "./auth-dialog";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: "",
    fromLocation: "",
    startDate: new Date(),
    duration: 3
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    onSearch(searchParams);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* From Location */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <Label htmlFor="fromLocation" className="text-lg flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Where are you traveling from?
            </Label>
            <Input
              id="fromLocation"
              placeholder="Enter your current location..."
              value={searchParams.fromLocation}
              onChange={(e) => setSearchParams({ ...searchParams, fromLocation: e.target.value })}
              className="h-12 bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 transition-colors"
            />
          </motion.div>

          {/* To Location */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            <Label htmlFor="location" className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Where would you like to go?
            </Label>
            <Input
              id="location"
              placeholder="Enter your dream destination..."
              value={searchParams.location}
              onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              className="h-12 bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 transition-colors"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date Picker */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              When do you want to travel?
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal bg-white/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors",
                    !searchParams.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchParams.startDate ? (
                    format(searchParams.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={searchParams.startDate}
                  onSelect={(date) => date && setSearchParams({ ...searchParams, startDate: date })}
                  initialFocus
                  className="rounded-lg border border-primary/20"
                />
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Duration Slider */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TripDuration
              value={searchParams.duration}
              onChange={(duration) => setSearchParams({ ...searchParams, duration })}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Button
            type="submit"
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={!searchParams.location || !searchParams.fromLocation || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Your Perfect Trip...
              </span>
            ) : user ? (
              "Plan My Adventure"
            ) : (
              "Sign In to Plan Your Adventure"
            )}
          </Button>
        </motion.div>
      </form>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </>
  );
}