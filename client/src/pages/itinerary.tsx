import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type Itinerary } from "@shared/schema";
import { Loader2 } from "lucide-react"; // Import Loader2 directly
import ItineraryContent from "@/components/itinerary-card"; // Import the refactored content component
import DestinationImages from "@/components/DestinationImages";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react"; // Import Calendar icon
import { useState, useEffect } from "react"; // For scrollspy effect

export default function ItineraryPage() {
  const { shareId } = useParams();
  const [activeDay, setActiveDay] = useState(1); // State for active day nav

  const { data: itinerary, isLoading } = useQuery<Itinerary>({
    queryKey: [`/api/itinerary/${shareId}`],
    enabled: !!shareId,
  });

  // Scrollspy effect for left navigation
  useEffect(() => {
    if (!itinerary) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayId = entry.target.id;
            const dayNumber = parseInt(dayId.split("-")[1], 10);
            setActiveDay(dayNumber);
          }
        });
      },
      {
        rootMargin: "-40% 0px -60% 0px", // Adjust trigger point
        threshold: 0, // Trigger as soon as element enters viewport margin
      }
    );

    const dayElements = document.querySelectorAll('[id^="day-"]');
    dayElements.forEach((el) => observer.observe(el));

    return () => {
      dayElements.forEach((el) => observer.unobserve(el));
    };
  }, [itinerary]);


  if (isLoading) {
    // Use a
    // ine loader here instead of the enhanced LoadingState
    return (
      <div className="flex items-center justify-center p-16 min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-red-500">
          Itinerary not found
        </h1>
      </div>
    );
  }

  const trimmedLocation = itinerary.location.split(",")[0];
  const startDateFormatted = new Date(itinerary.startDate).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    // Remove default container padding, apply max-width later if needed
    <div className="min-h-screen bg-background">
      {/* Header Section with Integrated Images */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <DestinationImages
            destination={trimmedLocation}
            apiKey={import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            // Add a prop for banner style if needed in DestinationImages
            layoutStyle="banner" 
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
        {/* Header Text Content */}
        <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-10 z-20 text-white container mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 shadow-text">
            {itinerary.duration}-Day Trip to {trimmedLocation}
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 flex items-center gap-2 shadow-text">
            <Calendar className="h-5 w-5" />
            Starting {startDateFormatted}
          </p>
        </div>
      </motion.header>

      {/* Main Content Area - Two Columns */}
      <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: Sticky Navigation (Desktop) / Top Nav (Mobile) */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 self-start"> 
          {/* TODO: Add mobile navigation (e.g., horizontal scroll or dropdown) */}
          <nav className="hidden lg:block space-y-2">
            <h3 className="text-lg font-semibold mb-3 text-primary">Trip Days</h3>
            {itinerary.plan.dailyPlans.map((day) => (
              <a
                key={day.day}
                href={`#day-${day.day}`}
                className={`block px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeDay === day.day
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default jump
                  document.getElementById(`day-${day.day}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' 
                  });
                  setActiveDay(day.day);
                }}
              >
                Day {day.day}
              </a>
            ))}
            {/* Optional: Links for Accommodation/Tips */}
             {itinerary.plan.accommodation && (
               <a href="#accommodation" className="block px-4 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">Accommodation</a>
             )}
             {itinerary.plan.travelTips && (
               <a href="#tips" className="block px-4 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">Travel Tips</a>
             )}
          </nav>
           {/* Mobile Nav: Horizontal Scroll */}
           <div className="lg:hidden mb-6 sticky top-0 bg-background/80 backdrop-blur-sm py-2 -mx-4 px-4 z-30 border-b">
             <nav className="flex space-x-3 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
               {itinerary.plan.dailyPlans.map((day) => (
                 <a
                   key={`mobile-day-${day.day}`}
                   href={`#day-${day.day}`}
                   className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                     activeDay === day.day
                       ? "bg-primary text-primary-foreground font-medium"
                       : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                   }`}
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById(`day-${day.day}`)?.scrollIntoView({
                       behavior: 'smooth',
                       block: 'start'
                     });
                     // Add slight offset for sticky mobile nav if needed later
                     setActiveDay(day.day);
                   }}
                 >
                   Day {day.day}
                 </a>
               ))}
               {/* Optional: Mobile links for Accommodation/Tips */}
               {itinerary.plan.accommodation && (
                 <a href="#accommodation" className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground">Accommodation</a>
               )}
               {itinerary.plan.travelTips && (
                 <a href="#tips" className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground">Travel Tips</a>
               )}
             </nav>
           </div>
        </aside>

        {/* Right Column: Scrollable Itinerary Details */}
        <main className="w-full lg:w-3/4 space-y-12">
          {/* Render the actual itinerary content using the refactored component */}
          <ItineraryContent itinerary={itinerary} />

          {/* Old ItineraryCard rendering removed */}
          {/* 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ItineraryCard itinerary={itinerary} /> 
          </motion.div> 
          */}
        </main>
      </div>
      <style>{`
        .shadow-text {
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }
        html {
           scroll-behavior: smooth; /* Ensure smooth scrolling for anchor links */
        }
        /* Simple utility to hide scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

      `}</style>
    </div>
  );
}