import { useState } from "react"; // Import useState
import { type Itinerary, type Activity } from "@shared/schema";
import { Bed, MapPin, Calendar, Clock, Info, ChevronRight, DollarSign, CalendarDays, Lightbulb, ChevronDown } from "lucide-react"; // Added ChevronDown
import { Loader2 } from "lucide-react"; // For loading state
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added more Card parts
import { Separator } from "@/components/ui/separator"; // For visual separation
import { Button } from "@/components/ui/button"; // For Know More button
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"; // For image modal
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"; // Import Collapsible components
import ActivityImage from "./ActivityImage"; // Import the new image component

// Define interfaces for props of potential sub-components
interface AccommodationSectionProps {
  accommodation: Itinerary['plan']['accommodation'];
}

interface DailyPlanSectionProps {
  dailyPlans: Itinerary['plan']['dailyPlans'];
}

interface TravelTipsSectionProps {
  travelTips: Itinerary['plan']['travelTips'];
  estimatedCost: Itinerary['plan']['estimatedTotalCost'];
  bestTime: Itinerary['plan']['bestTimeToVisit'];
}

// --- Accommodation Section Component ---
function AccommodationSection({ accommodation }: AccommodationSectionProps) {
  if (!accommodation || accommodation.length === 0) return null;

  return (
    <section id="accommodation" className="scroll-mt-24">
      {/* Use CardHeader style for consistency */}
      <div className="flex items-center gap-3 mb-4">
         <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 text-primary">
            <Bed className="h-5 w-5" />
         </span>
         <h2 className="text-xl font-bold text-foreground">Accommodation</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {accommodation.map((place, index) => (
          <Card key={index} className="bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
             <CardHeader className="pb-2">
                <CardTitle className="text-lg">{place.name}</CardTitle>
             </CardHeader>
            <CardContent className="text-sm space-y-1 pt-0">
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Type:</span> {place.type}</p>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Price:</span> {place.priceRange}</p>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Availability:</span> {place.availability}</p>
              {place.rating && (
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Rating:</span> {place.rating}</p>
              )}
              {/* {place.bookingUrl && ( // Remove Book Now button
                <a
                  href={place.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
                >
                  Book Now
                  <ChevronRight className="h-3 w-3" />
                </a>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// --- Activity Card Component ---
function ActivityCard({ activity }: { activity: Activity }) {
  // State for "Know More" feature
  const [knowMoreLoading, setKnowMoreLoading] = useState(false);
  const [knowMoreData, setKnowMoreData] = useState<string | null>(null);
  const [knowMoreError, setKnowMoreError] = useState<string | null>(null);
  // Note: Dialog manages its own open state via trigger/content interaction

  const handleKnowMoreClick = async () => {
    // Combine activity name and location for a better query
    const query = `${activity.activity}${activity.location ? `, ${activity.location}` : ''}`;
    
    setKnowMoreLoading(true);
    setKnowMoreData(null);
    setKnowMoreError(null);

    try {
      const response = await fetch('/api/place-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeQuery: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setKnowMoreData(data.details);
    } catch (error) {
      console.error("Error fetching place details:", error);
      setKnowMoreError(error instanceof Error ? error.message : "Failed to load details.");
    } finally {
      setKnowMoreLoading(false);
    }
  };


  return (
    // Removed border-l, using timeline dot instead
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Apply flex row layout on medium screens and up, keep vertical spacing for mobile. Reverse row for md+ and center items vertically */}
      <CardContent className="p-4 space-y-3 md:space-y-0 md:flex md:flex-row-reverse md:items-center md:gap-4">
        {/* Image Section (only renders if location exists and image is found) */}
        {activity.location && (
          // Wrapper for image to control size and prevent shrinking on desktop
          <Dialog>
            <DialogTrigger asChild>
              <div className="w-full md:w-40 md:flex-shrink-0 lg:w-48 cursor-pointer">
                <ActivityImage locationQuery={activity.location} />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-2">
              <ActivityImage locationQuery={activity.location} /> {/* Render image again in modal */}
            </DialogContent>
          </Dialog>
        )}

        {/* Wrapper for all text content to allow it to grow and maintain vertical spacing */}
        <div className="flex-grow space-y-3">

        {/* Top Row: Time & Cost */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Clock className="h-4 w-4" />
            <span>{activity.time}</span>
          </div>
          {activity.estimatedCost && (
             <div className="flex items-center gap-1 text-muted-foreground font-medium">
               {/* <DollarSign className="h-4 w-4" /> REMOVED */}
               <span>{activity.estimatedCost}</span>
             </div>
          )}
        </div>

        {/* Main Info: Title & Location */}
        <div>
           <h4 className="text-lg font-semibold text-foreground mb-1">{activity.activity}</h4>
           {activity.location && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <MapPin className="h-4 w-4 flex-shrink-0" />
               <span>{activity.location}</span>
             </div>
           )}
        </div>

        {/* Notes (if present) */}
        {activity.notes && (
          <>
            <Separator />
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:my-1">
              <ReactMarkdown>{activity.notes}</ReactMarkdown>
            </div>
          </>
        )}

        {/* Booking Info (if present) */}
        {activity.bookingInfo && (
          <>
            <Separator />
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Availability:</span> {activity.bookingInfo.availability}</p>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Price:</span> {activity.bookingInfo.price}</p>
              {/* {activity.bookingInfo.bookingUrl && ( // Remove Book Activity button
                <a
                  href={activity.bookingInfo.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
                >
                  Book Activity
                  <ChevronRight className="h-3 w-3" />
                </a>
              )} */}
            </div>
          </> // End Booking Info Fragment
        )}

        {/* "Know More" Button and Display Area - Moved outside Booking Info check */}
        <Separator />
        <div className="pt-2">
           <Button
             variant="outline"
             size="sm"
             onClick={handleKnowMoreClick} // Use the fetch handler
             disabled={knowMoreLoading}
             className="text-xs"
           >
             {knowMoreLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
             Know More
           </Button>
           {knowMoreLoading && <p className="text-xs text-muted-foreground mt-2">Loading details...</p>}
           {knowMoreError && <p className="text-xs text-red-600 mt-2">Error: {knowMoreError}</p>}
           {knowMoreData && (
             <div className="mt-2 text-sm text-muted-foreground prose prose-sm max-w-none prose-p:my-1 border-t pt-2"><ReactMarkdown>{knowMoreData}</ReactMarkdown></div>
           )}
        </div>
        </div>
      </CardContent>
    </Card>
  );
}


// --- Daily Plan Section Component ---
function DailyPlanSection({ dailyPlans }: DailyPlanSectionProps) {
  // State to manage open/closed status for each day's collapsible
  // Initialize all days as closed (false)
  const [openStates, setOpenStates] = useState<Record<number, boolean>>(
    dailyPlans.reduce((acc, day) => ({ ...acc, [day.day]: false }), {})
  );

  const toggleDay = (dayNumber: number) => {
    setOpenStates(prev => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
  };

  return (
    <>
      {dailyPlans.map((day) => (
        <section key={day.day} id={`day-${day.day}`} className="scroll-mt-24">
           <Collapsible open={openStates[day.day]} onOpenChange={() => toggleDay(day.day)}>
             {/* Day Header as Trigger */}
             <CollapsibleTrigger className="flex justify-between items-center w-full text-left gap-3 mb-2 p-2 rounded-md hover:bg-muted transition-colors group">
               <div className="flex items-center gap-3">
                 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                 </span>
                 <h2 className="text-xl font-bold text-foreground">Day {day.day}</h2>
               </div>
               <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openStates[day.day] ? 'rotate-180' : ''} group-hover:text-foreground`} />
             </CollapsibleTrigger>
             {/* Timeline Container within Collapsible Content */}
             <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
               <div className="space-y-6 relative pl-5 border-l-2 border-border ml-4 pt-4 pb-2"> {/* Added padding top/bottom */}
                 {day.activities.map((activity, actIndex) => (
                   <div key={actIndex} className="relative">
                     {/* Timeline Dot */}
                     <div className="absolute -left-[23px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary"></div>
                     <ActivityCard activity={activity} />
                   </div>
                 ))}
               </div>
             </CollapsibleContent>
           </Collapsible>
        </section>
      ))}
    </>
  );
}

// --- Travel Tips Section Component ---
function TravelTipsSection({ travelTips, estimatedCost, bestTime }: TravelTipsSectionProps) {
  if (!travelTips && !estimatedCost && !bestTime) return null;

  return (
    <section id="tips" className="scroll-mt-24 space-y-6">
       {/* Section Header */}
       <div className="flex items-center gap-3 mb-4">
         <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 text-primary">
            <Info className="h-5 w-5" />
         </span>
         <h2 className="text-xl font-bold text-foreground">Trip Information & Tips</h2>
       </div>
       
       {/* Info Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {estimatedCost && (
           <Card className="bg-card shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Estimated Total Cost</CardTitle>
               <DollarSign className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-xl font-semibold">{estimatedCost}</div> {/* Reduced font size */}
             </CardContent>
           </Card>
         )}
         {bestTime && (
           <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Best Time to Visit</CardTitle>
               <Calendar className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-md font-medium">{bestTime}</div>
             </CardContent>
           </Card>
         )}
       </div>

       {/* Tips Card */}
       {travelTips && travelTips.length > 0 && (
         <Card className="bg-card shadow-sm">
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-md">
                  <Lightbulb className="h-4 w-4 text-primary"/> Travel Tips
               </CardTitle>
            </CardHeader>
           <CardContent className="text-sm">
             <ul className="space-y-2 list-disc pl-5 text-muted-foreground prose prose-sm max-w-none prose-p:my-1">
               {travelTips.map((tip, index) => (
                 <li key={index}>
                   <ReactMarkdown>{tip}</ReactMarkdown>
                 </li>
               ))}
             </ul>
           </CardContent>
         </Card>
       )}
    </section>
  );
}


// --- Main Export (Now acts as a container for sections) ---
interface ItineraryContentProps {
  itinerary: Itinerary;
}

export default function ItineraryContent({ itinerary }: ItineraryContentProps) {
  return (
    <div className="space-y-12"> {/* Add spacing between sections */}
      <AccommodationSection accommodation={itinerary.plan.accommodation} />
      <DailyPlanSection dailyPlans={itinerary.plan.dailyPlans} />
      <TravelTipsSection 
        travelTips={itinerary.plan.travelTips} 
        estimatedCost={itinerary.plan.estimatedTotalCost}
        bestTime={itinerary.plan.bestTimeToVisit}
      />
    </div>
  );
}