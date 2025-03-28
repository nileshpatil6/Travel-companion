import { Card, CardContent, CardHeader } from "@/components/ui/card";
// Keep Accordion imports from the second block
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type Itinerary, type Activity } from "@shared/schema";
import { Share, Bed, MapPin, Calendar, Clock, Info, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ItineraryCardProps {
  itinerary: Itinerary;
}

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const handleShare = () => {
    // Simple feedback mechanism (optional)
    const shareButton = document.getElementById("share-button");
    if (shareButton) {
        shareButton.title = "Link copied!";
        setTimeout(() => {
            shareButton.title = "Copy share link";
        }, 2000);
    }
    navigator.clipboard.writeText(window.location.href);
  };

  // Use styling from the FIRST block
  return (
    <Card className="max-w-4xl mx-auto">
      {/* Header Styling from FIRST block */}
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/5 p-4 sm:p-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">{itinerary.location}</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-muted-foreground mt-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            <p>From: {itinerary.fromLocation}</p>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-4" />
            <p>{new Date(itinerary.startDate).toLocaleDateString()}</p>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {itinerary.duration} day itinerary
          </p>
        </div>
        <button
          id="share-button" // Added an ID for potential JS interaction
          onClick={handleShare}
          className="p-2 hover:bg-accent rounded-full transition-colors"
          title="Copy share link"
        >
          <Share className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </CardHeader>
      {/* Content Styling from FIRST block (adjust padding if needed due to header bg) */}
      <CardContent className="p-4 sm:p-6 space-y-6"> {/* Added pt-6 for padding below header */}

        {/* Accommodation Section - Styling from FIRST block */}
        {itinerary.plan.accommodation && (
          <div className="bg-accent/5 p-4 sm:p-6 rounded-lg">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Bed className="h-5 w-5 sm:h-6 sm:w-6" />
              Recommended Accommodations
            </h3>
            <div className="grid gap-4">
              {itinerary.plan.accommodation.map((place, index) => (
                <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h4 className="text-lg sm:text-xl font-semibold">{place.name}</h4>
                  {/* Grid and text styling from FIRST block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm sm:text-base"> {/* Adjusted grid for responsiveness */}
                    <p><span className="font-medium">Type:</span> {place.type}</p>
                    <p><span className="font-medium">Price:</span> {place.priceRange}</p>
                    <p><span className="font-medium">Availability:</span> {place.availability}</p>
                    {place.rating && (
                      <p><span className="font-medium">Rating:</span> {place.rating}</p>
                    )}
                  </div>
                  {/* Button styling from FIRST block */}
                  {place.bookingUrl && (
                    <a
                      href={place.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium" // Ensured button style consistency
                    >
                      Book Now
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Plans - Use Accordion Structure from SECOND block, styled like FIRST block's sections */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4">Daily Itinerary</h3>
          {/* Use Accordion component but style items/triggers/content to match FIRST block's day sections */}
          <Accordion type="single" collapsible className="space-y-4">
            {itinerary.plan.dailyPlans.map((day, index) => (
              // Apply outer styling of a day section (bg, padding, rounded) to the item wrapper
              <div key={index} className="bg-accent/5 p-3 sm:p-4 rounded-lg"> {/* Adjusted padding slightly for accordion */}
                <AccordionItem value={`day-${index + 1}`} className="border-b-0">
                  {/* Style Trigger like the Day heading in the FIRST block */}
                  <AccordionTrigger className="text-lg sm:text-xl font-bold text-primary hover:no-underline py-2 px-2"> {/* Added padding to trigger */}
                      Day {day.day}
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2"> {/* Added padding to content */}
                    {/* Style activity container and activities like FIRST block */}
                    <div className="space-y-3">
                      {day.activities.map((activity: Activity, actIndex) => (
                        <div key={actIndex} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-primary hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 text-primary">
                            <Clock className="h-4 w-4" />
                            <p className="font-semibold">{activity.time}</p>
                          </div>
                          <p className="text-base sm:text-lg mt-1">{activity.activity}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm sm:text-base text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <p>{activity.location}</p>
                          </div>
                          <p className="text-sm sm:text-base font-medium mt-2">
                            Est. Cost: <span className="text-primary">{activity.estimatedCost}</span>
                          </p>
                          {/* Notes styling from FIRST block */}
                          {activity.notes && (
                            <div className="mt-2 bg-accent/10 p-2 rounded text-sm sm:text-base prose prose-sm max-w-none">
                              <ReactMarkdown>{activity.notes}</ReactMarkdown>
                            </div>
                          )}
                          {/* Booking Info styling from FIRST block */}
                          {activity.bookingInfo && (
                            <div className="mt-3 p-3 bg-accent/10 rounded text-sm sm:text-base space-y-1"> {/* Added space-y-1 */}
                              <p><span className="font-medium">Availability:</span> {activity.bookingInfo.availability}</p>
                              <p><span className="font-medium">Price:</span> {activity.bookingInfo.price}</p>
                              {activity.bookingInfo.bookingUrl && (
                                <a
                                  href={activity.bookingInfo.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium" // Ensured button style consistency
                                >
                                  Book Activity
                                  <ChevronRight className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>

        {/* Bottom Info Section (Cost, Time, Tips) - Styling from FIRST block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-accent/5 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Estimated Total Cost
            </h3>
            <p className="text-base sm:text-lg">{itinerary.plan.estimatedTotalCost}</p>
          </div>

          <div className="bg-accent/5 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Best Time to Visit
            </h3>
            <p className="text-base sm:text-lg">{itinerary.plan.bestTimeToVisit}</p>
          </div>

          <div className="sm:col-span-2 bg-accent/5 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Travel Tips
            </h3>
            <ul className="space-y-2">
              {itinerary.plan.travelTips.map((tip, index) => (
                <li key={index} className="text-sm sm:text-base flex items-start gap-2 prose prose-sm max-w-none">
                  <span className="text-primary pt-1">•</span>
                  <ReactMarkdown>{tip}</ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}